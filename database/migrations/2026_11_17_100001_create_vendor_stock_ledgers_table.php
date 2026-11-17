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
        Schema::create('vendor_stock_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendor_profiles')->cascadeOnDelete();
            $table->foreignId('vendor_product_id')->constrained('vendor_products')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            
            $table->enum('transaction_type', [
                'opening_stock',
                'stock_inward',
                'order_deduct',
                'order_cancelled_restock',
                'damage_loss',
                'manual_audit_adjustment',
            ]);

            $table->enum('flow', ['inward', 'outward']);

            $table->decimal('quantity', 12, 2);
            $table->decimal('balance_before', 12, 2);
            $table->decimal('balance_after', 12, 2);

            $table->string('reference_no', 100)->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();

            $table->index(['vendor_id', 'vendor_product_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_stock_ledgers');
    }
};
