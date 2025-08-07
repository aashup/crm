<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Party>
 */
class PartyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'contact_id' => null, // Assuming contact_id is optional and can be null
            'name' => $this->faker->company,
            'mobile' => '+' . $this->faker->numerify('91##########'),
            'gstin' => $this->faker->regexify('[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]'),
            'opening_balance' => $this->faker->randomFloat(2, 0, 10000),
            'opening_balance_date' => $this->faker->date(),
            'gst_type' => rand(1, 3), // Example GST type, modify as needed
            'credit_limit' => $this->faker->boolean,
            'credit_limit_amount' => $this->faker->randomFloat(2, 0, 100000),
            'billing_address_id' => null,
            'shipping_address_id' => null,
            'email' => $this->faker->unique()->safeEmail,
        ];
    }
}
