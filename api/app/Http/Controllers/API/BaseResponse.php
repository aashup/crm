<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Response;

class BaseResponse
{
    public static function success($data, $status = 200, $headers = []): Response
    {
        $content = $data;
        if (! isset($data['status'])) {
            $content = ['data' => $data, 'status' => 'success'];
        }

        return response($content, $status, $headers);
    }

    public static function error($data, $status = 422, $headers = []): Response
    {
        $content = $data;
        if (! isset($data['status'])) {
            $content = ['errors' => $data, 'status' => 'error'];
        }

        return response($content, $status, $headers);
    }
}
