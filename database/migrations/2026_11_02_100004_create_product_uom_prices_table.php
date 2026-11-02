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
        Schema::create('product_uom_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('uom_id')->constrained('units_of_measure');
            $table->decimal('conversion_factor', 14, 4)->default(1.0000);
            $table->decimal('selling_price', 12, 2);
            $table->decimal('mrp', 12, 2)->nullable();
            $table->decimal('bulk_discount_price', 12, 2)->nullable();
            $table->boolean('allow_loose_sale')->default(false);
            $table->decimal('min_order_qty', 10, 2)->default(1.00);
            $table->decimal('step_qty', 10, 2)->default(1.00);
            $table->decimal('pack_contain_qty', 10, 2)->nullable();
            $table->boolean('is_default_selling_unit')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['product_id', 'uom_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_uom_prices');
    }
};
