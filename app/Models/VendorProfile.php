<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'business_name',
        'gst',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}