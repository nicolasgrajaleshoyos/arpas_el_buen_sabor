<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('cash_amount', 10, 2)->default(0)->after('total');
            $table->decimal('transfer_amount', 10, 2)->default(0)->after('cash_amount');
            $table->string('payment_method')->default('cash')->after('transfer_amount'); // 'cash', 'transfer', 'combined'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['cash_amount', 'transfer_amount', 'payment_method']);
        });
    }
};
