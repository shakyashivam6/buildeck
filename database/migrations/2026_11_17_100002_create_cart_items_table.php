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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendor_profiles')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('uom_id')->constrained('units_of_measure');
            
            $table->enum('purchase_type', ['package', 'loose'])->default('package');
            $table->decimal('quantity', 10, 2);
            $table->decimal('conversion_factor', 14, 4)->default(1.0000);
            $table->decimal('base_quantity', 12, 2);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 12, 2);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
