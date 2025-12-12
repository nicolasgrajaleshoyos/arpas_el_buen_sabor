<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HRTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->create();
        $this->actingAs($user);
    }

    public function test_can_create_employee()
    {
        $data = [
            'name' => 'Pedro Empleado',
            'position' => 'Cocinero',
            'salary' => 1500000,
            'hire_date' => now()->toDateString(),
            'phone' => '3001234567',
            'email' => 'pedro@empleado.com'
        ];

        $response = $this->postJson('/api/employees', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('employees', ['email' => 'pedro@empleado.com']);
    }

    public function test_can_list_employees()
    {
        \App\Models\Employee::create([
             'name' => 'Maria',
             'position' => 'Mesera',
             'salary' => 1200000
        ]);

        $response = $this->getJson('/api/employees');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Maria']);
    }
    public function test_can_create_employee_advance()
    {
        $employee = \App\Models\Employee::create([
             'name' => 'Luis',
             'position' => 'Mesero',
             'salary' => 1200000
        ]);

        $response = $this->postJson('/api/employee-advances', [
            'employee_id' => $employee->id,
            'amount' => 50000,
            'request_date' => now()->toDateString(),
            'reason' => 'Transporte',
            'status' => 'pending'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('employee_advances', ['amount' => 50000]);
    }

    public function test_can_generate_payroll()
    {
        $response = $this->postJson('/api/payrolls', [
            'month' => 11, // December (0-indexed)
            'year' => 2024,
            'employees' => [['name' => 'Luis', 'salary' => 1200000, 'net' => 1100000]],
            'total' => 1100000,
            'generated_date' => now()->toDateString()
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('payrolls', ['month' => 11, 'total' => 1100000]);
    }
}
