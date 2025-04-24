<?php

namespace App\Mail;

use App\Models\PasswordResetToken;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgotPassword extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @var PasswordReset
     */
    public $model;
    /**
     * @var User
     */
    public $user;

    public $reset_link;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user, PasswordResetToken $model)
    {
        $this->user = $user;
        $this->model = $model;
        $this->reset_link = config('services.urls.app_url');
        $this->reset_link .= '/check-reset-password-link/'. $this->model->token;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('ThoughtSole :: Forgot Password')->view('emails.forgot_password');
    }
}
