import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Menu, Button } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { format, subMonths } from 'date-fns';
import { transactionApi, accountApi } from '../services/api';
import { useThemeToggle } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56'
];

const AnalysisScreen = () => {
  const { theme } = useThemeToggle();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState({ x: 0, y: 0 });

  // Fetch accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch transactions when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions();
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const accountsData = await accountApi.getAccounts();
      setAccounts(accountsData);
      if (accountsData.length > 0 && !selectedAccount) {
        setSelectedAccount(accountsData[0]);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      if (selectedAccount) {
        const data = await transactionApi.getTransactions({
          accountId: selectedAccount._id,
          startDate: subMonths(new Date(), 1).toISOString(),
          endDate: new Date().toISOString()
        });
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for pie chart (expenses by category)
  const expenseData = React.useMemo(() => {
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Loading analysis...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button
          mode="outlined"
          onPress={(e) => {
            const { pageX, pageY } = e.nativeEvent;
            setAccountMenuAnchor({ x: pageX, y: pageY });
            setAccountMenuVisible(true);
          }}
          style={styles.accountButton}
        >
          {selectedAccount ? selectedAccount.name : 'Select Account'}
        </Button>

        <Menu
          visible={accountMenuVisible}
          onDismiss={() => setAccountMenuVisible(false)}
          anchor={accountMenuAnchor}
          style={styles.accountMenu}
        >
          {accounts.map(account => (
            <Menu.Item
              key={account._id}
              title={account.name}
              description={`Balance: $${account.balance.toFixed(2)}`}
              onPress={() => {
                setSelectedAccount(account);
                setAccountMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>

      {expenseData.length > 0 && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
              Expenses by Category
            </Text>
            <PieChart
              data={expenseData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => theme.colors.primary,
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  accountButton: {
    marginBottom: 10,
  },
  accountMenu: {
    marginTop: 10,
  },
  card: {
    margin: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AnalysisScreen; 