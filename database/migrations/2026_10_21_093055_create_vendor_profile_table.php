<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vendor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('vendor_name');
            $table->string('owner_name');
            $table->string('email')->nullable();
            $table->string('mobile', 20)->nullable();
            $table->text('address')->nullable();
            $table->foreignId('state_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('pincode', 10)->nullable();
            $table->decimal('supply_radius', 8, 2)->nullable()->comment('Supply radius in KM');
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('long', 11, 8)->nullable();
            $table->string('gst', 20)->nullable();
            $table->string('aadhaar', 20)->nullable();
            $table->string('pan', 15)->nullable();
            $table->string('bussiness_certificate')->nullable();
            $table->string('aadaar_doc')->nullable();
            $table->string('pan_doc')->nullable();
            $table->string('bussiness_certificate_doc')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'deactivated'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_profiles');
    }
};
