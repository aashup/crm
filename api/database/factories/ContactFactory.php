<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Address>
 */
class ContactFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'mob1'    => '+' . $this->faker->numerify('91##########'),
            'mob2'    => '+' . $this->faker->numerify('1##########'),
            'status' => 1,
            'created_by' => 1
        ];
    }
}
