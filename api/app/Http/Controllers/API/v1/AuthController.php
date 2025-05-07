<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Mail\EmailVerification;
use App\Mail\ForgotPassword;
use App\Models\PasswordResetToken;
use App\Models\User;
use App\Repository\MenuRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Login to get access token
     * @return ApiResponser
     */
    public function login(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
            'password' => 'required',
        ]);
        $user = User::whereEmail($request->email)->first();
        if ($user && Hash::check($request->password, $user->password)) {
            return $this->success('Login Successfully!', $this->generateToken($user));
        }
        return $this->error('Unauthorised User or Email not verified!!', $request->all());
    }

    protected function generateToken(User $user)
    {
        $data = [
            'access_token' => $user->createToken('access_token', ['*'])->accessToken,
            'user' => $user,
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'menus' => Cache::remember('cache_menus', 60 * 60, function () use ($user) {
                return (new MenuRepository())->getMenu($user);
            }),
        ];
        return $data;
    }

    /**
     * Register user
     * @return ApiResponser;
     */

    public function register(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required',
            'cpassword' => 'required_with:password|same:password',
            // 'roles' => 'required',
        ]);

        try {
            DB::beginTransaction();
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
            ]);
            // $roles = Role::whereIn('id', $request->roles)->get();
            // $user->assignRole($roles);

            Mail::to($user->email)->send(new EmailVerification($user));

            DB::commit();
            return $this->success('Registration successfully !!', $user);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error($e->getMessage());
        }
    }

    public function emailVerification(Request $request)
    {
        $id = decrypt($request->id);
        if ($user = User::find($id)) {
            if (!(Carbon::parse($user->created_at) < now()->subDays(5))) {
                if (!$user->email_verified_at) {
                    $user->email_verified_at = now();
                    $user->save();
                }
                return redirect(Config::get('services.urls.ui_url') . '/auth/login');
            } else {
                return view('errors.link_expire');
            }
        } else {
            return view('errors.user_not_found');
        }
    }


    public function logout(Request $request)
    {
        $token = $request->user()->token();
        $token->revoke();
        return $this->success('Logout Successfully');
    }

    public function forgotPassword(Request $request)
    {
        $this->validate($request, [
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return $this->error('Email address invalid or not register with us');
        }

        $token = Str::random(160);
        $model = PasswordResetToken::where('email', $request->email)->first() ?: new PasswordResetToken();
        $model->email = $request->email;
        $model->token = $token;
        $model->created_at = now();
        if ($model->save()) {
            Mail::to($model)->send(new ForgotPassword($user, $model));
        }
        return $this->success('Password reset mail sent on your email address. Please check!!2');
    }

    public function checkResetPasswordLink(Request $request)
    {
        $token = PasswordResetToken::where('token', $request->token)->first();
        if ($token && !(Carbon::parse($token->created_at) < now()->subDays(5))) {
            return redirect(Config::get('services.urls.ui_url') . '/auth/reset-password/' . $request->token);
        }
        return view('errors.token-expire');
    }

    public function resetPassword(Request $request)
    {
        $this->validate($request, [
            'token' => ['required'],
            'password' => ['required'],
            'cpassword' => 'required_with:password|same:password',
        ]);
        if ($token = PasswordResetToken::where('token', $request->token)->first()) {
            $user = User::where('email', $token->email)->first();
            if ($user) {
                $user->password = bcrypt($request->password);
                return $user->save() ? $this->success('Password successfully reset. Please Login with new password.')
                    : $this->error('Password Resetting Failed Please try again.');
            }
        }

        return $this->error('Reset Link Expire !. Send reset link again!');
    }
}
