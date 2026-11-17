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
        Schema::create('vendor_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendor_profiles')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('stock', 12, 2)->default(0.00);
            $table->decimal('amount', 12, 2);
            $table->decimal('mrp', 12, 2)->nullable();
            $table->decimal('min_order_qty', 10, 2)->default(1.00);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['vendor_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_products');
    }
};
