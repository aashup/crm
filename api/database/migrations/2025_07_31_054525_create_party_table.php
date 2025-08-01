<?php

use App\Models\Permission;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('parties', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('gstin')->nullable();
            $table->string('mobile')->nullable();
            $table->decimal('opening_balance', 15, 2)->nullable()->default(0.00);
            $table->date('opening_balance_date')->nullable();
            $table->integer('gst_type')->nullable()->comment("1: Unregiter/Consumer, 2: Registered - Regular, 3: Register - Composition");
            $table->boolean('credit_limit')->default(false);
            $table->decimal('credit_limit_amount', 15, 2)->default(0.00);
            $table->string('billing_address')->nullable();
            $table->foreignId('state_id')->nullable()->constrained('states')->onDelete('set null');
            $table->string('email')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        $permisions = [
            "view any",
            "show",
            "create",
            "update",
            "delete",
        ];

        $parentId = DB::table('menus')->insertGetId([
            'name' => 'Parties',
            'page' => '/app/parties',
            'icon' => 'element-11',
            'root' => 1,
            'status' => 1,
            'parent_id' => null,
            'order_by' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($permisions as $permission) {
            $permissions = Permission::create([
                'name' => Str::slug("Parties {$permission}", '.'),
                'guard_name' => 'api',
                'description' => $permission,
                'menu_id' => $parentId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $permissions->roles()->attach(1);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parties');
        DB::table('menus')->where('name', 'Parties')->delete();
        $permissions = Permission::where('name', 'like', 'parties%')->get();
        foreach ($permissions as $permission) {
            $permission->roles()->detach();
            $permission->delete();
        }
    }
};
