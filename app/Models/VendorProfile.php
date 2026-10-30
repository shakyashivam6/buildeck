<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VendorProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'vendor_name',
        'owner_name',
        'email',
        'mobile',
        'address',
        'state_id',
        'city_id',
        'pincode',
        'supply_radius',
        'lat',
        'long',
        'gst',
        'aadhaar',
        'pan',
        'bussiness_certificate',
        'aadaar_doc',
        'pan_doc',
        'bussiness_certificate_doc',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'state_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'city_id');
    }
}
