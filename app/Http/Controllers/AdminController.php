<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard() {
        $data = [
            'title' => "Dashboard"
        ];
        return Inertia::render('Admin/Dashboard', ['data' => $data]);
    }
}
