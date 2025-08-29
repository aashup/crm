<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Expense Report</title>
    <style>
          body {
            font-family: 'DejaVu Sans', sans-serif;
            padding: 20px;
        }

        .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .report-table th,
        .report-table td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }

        .report-table th {
            background-color: #1976d2;
            color: white;
        }

        .report-table tr:nth-child(even) td {
            background-color: #f9f9f9;
        }

        .total-section {
            margin-top: 30px;
            font-size: 16px;
            font-weight: bold;
        }

        .balance-negative {
            color: red;
        }

        .balance-positive {
            color: green;
        }
    </style>
</head>

<body>
    <h1>Expense Report</h1>

    <table class="report-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Expense Type</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalGain = 0;
                $totalExpense = 0;
            @endphp

            @foreach($expenses as $index => $expense)
                @php
                    if ($expense->expense_type === 'gain') {
                        $totalGain += $expense->amount;
                    } elseif ($expense->expense_type === 'expense') {
                        $totalExpense += $expense->amount;
                    }
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $expense->expense_type }}</td>
                    <td>{{ number_format($expense->amount, 2) }}</td>
                    <td>{{ $expense->note ?? '' }}</td>
                    <td>{{ \Carbon\Carbon::parse($expense->created_at)->format('M d, Y') }}</td>
                </tr>
            @endforeach

            @php
                $balance = $totalGain - $totalExpense;
            @endphp
        </tbody>
    </table>

    <div class="total-section">
        <p>Total Gain : Rs.{{ number_format($totalGain, 2) }}</p>
        <p>Total Expense: Rs.{{ number_format($totalExpense, 2) }}</p>
        <p class="{{ $balance < 0 ? 'balance-negative' : 'balance-positive' }}">
            Balance: Rs.{{ number_format($balance, 2) }}
            {{ $balance < 0 ? '↓' : '↑' }}
        </p>

    </div>
</body>

</html>