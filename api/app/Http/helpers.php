<?php

use Illuminate\Support\Facades\DB;

function getTaxRateIdFromString(string $taxString): ?int
{
    if (!str_contains($taxString, '@')) {
        return null;
    }

    [$typeName, $rate] = explode('@', $taxString);

    $typeName = strtoupper(trim($typeName));
    $rate = (float) trim($rate);

    $typeMap = [
        'GST'         => 1,
        'IGST'        => 2,
        'CGST'        => 3,
        'SGST'        => 4,
        'VAT'         => 5,
        'SERVICE TAX' => 6,
        'OTHER'       => 7,
    ];

    if (!isset($typeMap[$typeName])) {
        return null;
    }

    return DB::table('tax_rates')
        ->where('type', $typeMap[$typeName])
        ->where('rate', $rate)
        ->where('is_active', 1)
        ->whereNull('deleted_at')
        ->value('id');
}
