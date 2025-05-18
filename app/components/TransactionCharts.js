import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useThemeToggle } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56'
];

const TransactionCharts = ({ transactions }) => {
  const { theme } = useThemeToggle();

  // Prepare data for pie chart (expenses by category)
  const expenseData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category,
      amount,
      color: COLORS[index % COLORS.length],
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12
    }));
  }, [transactions, theme.colors.onSurface]);

  // Prepare data for line chart (income vs expenses over time)
  const lineChartData = useMemo(() => {
    const last3Days = Array.from({ length: 3 }, (_, i) => subDays(new Date(), i));
    const labels = last3Days.map(date => format(date, 'MMM dd')).reverse();
    
    const dailyData = last3Days.map(date => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= dayStart && transDate <= dayEnd;
      });

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return { income, expense };
    }).reverse();

    return {
      labels,
      datasets: [
        {
          data: dailyData.map(d => d.income),
          color: () => '#4CAF50',
          strokeWidth: 2
        },
        {
          data: dailyData.map(d => d.expense),
          color: () => '#F44336',
          strokeWidth: 2
        }
      ],
      legend: ['Income', 'Expenses']
    };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.noDataText, { color: theme.colors.onSurfaceVariant }]}>
            No transaction data available for charts
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {expenseData.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
              Expenses by Category
            </Text>
            <PieChart
              data={expenseData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => theme.colors.onSurface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
            Income vs Expenses (Last 3 Days)
          </Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.onSurface,
              labelColor: (opacity = 1) => theme.colors.onSurface,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
              }
            }}
            bezier
            style={styles.lineChart}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
  },
});

export default TransactionCharts; 