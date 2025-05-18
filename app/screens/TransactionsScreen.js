import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView, Platform, Share, Modal, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Searchbar, Menu, Button, Portal, Dialog, Paragraph, IconButton, Divider, FAB, List, useTheme, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { transactionApi, accountApi } from '../services/api';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

const TransactionsScreen = () => {
  const paperTheme = useTheme();
  const { userToken } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [categories, setCategories] = useState([]);
  const typeButtonRef = useRef(null);
  const [typeMenuPosition, setTypeMenuPosition] = useState({ x: 0, y: 0 });
  const [accountDropdownVisible, setAccountDropdownVisible] = useState(false);
  const accountButtonRef = useRef(null);
  const [accountMenuPosition, setAccountMenuPosition] = useState({ x: 0, y: 0 });

  const fetchData = useCallback(async () => {
    if (!userToken) {
      setError('Please login to view transactions');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [transactionsData, accountsData] = await Promise.all([
        transactionApi.getTransactions(),
        accountApi.getAccounts()
      ]);
      setTransactions(transactionsData);
      setAccounts(accountsData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(transactionsData.map(t => t.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleDateChange = (event, selectedDate, isStartDate) => {
    if (Platform.OS === 'android') {
      if (isStartDate) {
        setShowStartDatePicker(false);
      } else {
        setShowEndDatePicker(false);
      }
    }
    
    if (selectedDate) {
      if (isStartDate) {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedAccount(null);
    setSelectedCategory(null);
    setStartDate(startOfMonth(subMonths(new Date(), 1)));
    setEndDate(endOfMonth(new Date()));
    setSearchQuery('');
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || transaction.type === selectedType;
    const matchesAccount = !selectedAccount || transaction.accountId?._id === selectedAccount._id;
    const matchesCategory = !selectedCategory || transaction.category === selectedCategory;
    const transactionDate = new Date(transaction.date);
    const matchesDate = transactionDate >= startDate && transactionDate <= endDate;
    
    return matchesSearch && matchesType && matchesAccount && matchesCategory && matchesDate;
  });

  const exportToPDF = async () => {
    try {
      setExporting(true);
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { 
                font-family: Arial, sans-serif;
                background-color: ${paperTheme.dark ? '#121212' : '#ffffff'};
                color: ${paperTheme.dark ? '#ffffff' : '#000000'};
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                background-color: ${paperTheme.dark ? '#1e1e1e' : '#ffffff'};
              }
              th, td { 
                padding: 8px; 
                text-align: left; 
                border-bottom: 1px solid ${paperTheme.dark ? '#333333' : '#dddddd'};
              }
              th { 
                background-color: ${paperTheme.dark ? '#2d2d2d' : '#f5f5f5'};
              }
              .income { color: #4CAF50; }
              .expense { color: #F44336; }
              .header { 
                text-align: center; 
                margin-bottom: 20px;
                background-color: ${paperTheme.dark ? '#1e1e1e' : '#ffffff'};
                padding: 20px;
                border-radius: 8px;
              }
              .summary { 
                margin: 20px 0; 
                padding: 10px; 
                background-color: ${paperTheme.dark ? '#2d2d2d' : '#f5f5f5'};
                border-radius: 8px;
              }
              .total { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Transactions Report</h2>
              <p>Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
              ${selectedAccount ? `<p>Account: ${selectedAccount.name}</p>` : ''}
              <p>Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}</p>
            </div>
            <div class="summary">
              <p>Total Transactions: ${filteredTransactions.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Account</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(t => `
                  <tr>
                    <td>${formatDate(t.date)}</td>
                    <td>${t.category || ''}</td>
                    <td>${t.description || ''}</td>
                    <td>${t.type}</td>
                    <td class="${t.type}">${formatCurrency(t.amount)}</td>
                    <td>${t.accountId?.name || 'Unknown Account'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Transactions',
          UTI: 'com.adobe.pdf'
        });
      }
    } catch (err) {
      console.error('Error exporting transactions:', err);
      setError('Failed to export transactions. Please try again.');
    } finally {
      setExporting(false);
      setExportMenuVisible(false);
    }
  };

  const handleFilterPress = () => {
    if (typeButtonRef.current) {
      typeButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTypeMenuPosition({ x: pageX, y: pageY + height });
        setFilterMenuVisible(true);
      });
    }
  };

  const handleAccountPress = () => {
    if (accountButtonRef.current) {
      accountButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setAccountMenuPosition({ x: pageX, y: pageY + height });
        setAccountDropdownVisible(true);
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!userToken) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
          Please login to view transactions
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: paperTheme.colors.surface }]}>
        <TouchableOpacity 
          ref={accountButtonRef}
          style={[styles.accountDropdown, { backgroundColor: paperTheme.colors.surfaceVariant }]}
          onPress={handleAccountPress}
        >
          <Text style={[styles.accountDropdownText, { color: paperTheme.colors.onSurface }]}>
            {selectedAccount ? `${selectedAccount.name} (${selectedAccount.type})` : 'All Accounts'}
          </Text>
          <Ionicons 
            name={accountDropdownVisible ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={paperTheme.colors.onSurface} 
          />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search transactions"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            icon="magnify"
          />
          {transactions.length > 0 && (
            <IconButton
              icon={exporting ? 'loading' : 'export'}
              size={24}
              onPress={() => setExportMenuVisible(true)}
              style={styles.exportButton}
              disabled={exporting}
            />
          )}
        </View>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: paperTheme.colors.surface }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScrollContent}
        >
          <Button 
            ref={typeButtonRef}
            mode="outlined" 
            onPress={handleFilterPress}
            style={styles.filterButton}
            icon={selectedType ? 'check' : 'filter-variant'}
            labelStyle={styles.filterButtonLabel}
          >
            {selectedType ? `Type: ${selectedType}` : 'Type'}
          </Button>

          <Button 
            mode="outlined" 
            onPress={() => setShowStartDatePicker(true)}
            style={styles.filterButton}
            icon="calendar-start"
            labelStyle={styles.filterButtonLabel}
          >
            From: {format(startDate, 'MMM dd')}
          </Button>

          <Button 
            mode="outlined" 
            onPress={() => setShowEndDatePicker(true)}
            style={styles.filterButton}
            icon="calendar-end"
            labelStyle={styles.filterButtonLabel}
          >
            To: {format(endDate, 'MMM dd')}
          </Button>

          <Button 
            mode="outlined" 
            onPress={clearFilters}
            style={styles.filterButton}
            icon="filter-remove"
            labelStyle={styles.filterButtonLabel}
          >
            Clear
          </Button>
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.transactionList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
          />
        }
      >
        {filteredTransactions.map((transaction) => (
          <Card
            key={transaction._id || transaction.id || transaction.transactionId}
            style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
          >
            <Card.Content>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <View style={styles.categoryContainer}>
                    <Text style={[styles.category, { color: paperTheme.colors.onSurface }]}>
                      {transaction.category || 'Uncategorized'}
                    </Text>
                    <View style={[
                      styles.typeContainer,
                      { backgroundColor: transaction.type === 'income' ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                      <Text style={[
                        styles.typeText,
                        { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
                      ]}>
                        {transaction.type?.toUpperCase() || 'UNKNOWN'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.description, { color: paperTheme.colors.onSurface }]}>
                    {transaction.description || 'No description'}
                  </Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={[
                    styles.amount,
                    { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionMeta}>
                <Text style={[styles.date, { color: paperTheme.colors.onSurfaceVariant }]}>
                  {formatDate(transaction.date)}
                </Text>
                <View style={styles.accountInfo}>
                  <Text style={[styles.account, { color: paperTheme.colors.onSurfaceVariant }]}>
                    {transaction.accountId?.name || 'Unknown Account'}
                  </Text>
                  <Text style={[styles.accountType, { color: paperTheme.colors.onSurfaceVariant }]}>
                    {transaction.accountId?.type || ''}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={typeMenuPosition}
          style={[
            styles.menu,
            {
              backgroundColor: paperTheme.colors.surface,
              position: 'absolute',
              left: typeMenuPosition.x,
              top: typeMenuPosition.y,
              minWidth: 200,
              maxWidth: 300,
            }
          ]}
        >
          <Menu.Item
            title="All Types"
            onPress={() => {
              setSelectedType(null);
              setFilterMenuVisible(false);
            }}
            leadingIcon="close"
          />
          <Menu.Item
            title="Income"
            onPress={() => {
              setSelectedType('income');
              setFilterMenuVisible(false);
            }}
            leadingIcon="arrow-up"
          />
          <Menu.Item
            title="Expense"
            onPress={() => {
              setSelectedType('expense');
              setFilterMenuVisible(false);
            }}
            leadingIcon="arrow-down"
          />
        </Menu>

        <Menu
          visible={exportMenuVisible}
          onDismiss={() => setExportMenuVisible(false)}
          anchor={{ x: 0, y: 0 }}
          style={[styles.exportMenu, { backgroundColor: paperTheme.colors.surface }]}
        >
          <Menu.Item
            title="Export to PDF"
            leadingIcon="file-pdf-box"
            onPress={() => {
              setExportMenuVisible(false);
              exportToPDF();
            }}
            disabled={exporting}
          />
        </Menu>

        {(showStartDatePicker || showEndDatePicker) && (
          <DateTimePicker
            value={showStartDatePicker ? startDate : endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleDateChange(event, date, showStartDatePicker)}
            maximumDate={showStartDatePicker ? endDate : new Date()}
            minimumDate={showStartDatePicker ? undefined : startDate}
          />
        )}

        <Menu
          visible={accountDropdownVisible}
          onDismiss={() => setAccountDropdownVisible(false)}
          anchor={accountMenuPosition}
          style={[
            styles.accountMenu,
            {
              backgroundColor: paperTheme.colors.surface,
              position: 'absolute',
              left: accountMenuPosition.x,
              top: accountMenuPosition.y,
              minWidth: 200,
              maxWidth: 300,
            }
          ]}
        >
          <Menu.Item
            title="All Accounts"
            onPress={() => {
              setSelectedAccount(null);
              setAccountDropdownVisible(false);
            }}
            leadingIcon="account-multiple"
          />
          {accounts.map(account => (
            <Menu.Item
              key={account._id}
              title={account.name}
              description={account.type}
              onPress={() => {
                setSelectedAccount(account);
                setAccountDropdownVisible(false);
              }}
              leadingIcon={
                account.type === 'Savings' ? 'piggy-bank' :
                account.type === 'Current' ? 'bank' :
                account.type === 'Investment' ? 'chart-line' :
                account.type === 'Credit Card' ? 'credit-card' :
                'cash'
              }
            />
          ))}
        </Menu>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 12,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchbar: {
    flex: 1,
    elevation: 0,
    height: 40,
  },
  filterContainer: {
    paddingVertical: 4,
    elevation: 2,
    maxHeight: 48,
  },
  filterScrollContent: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    borderRadius: 16,
    height: 36,
    paddingHorizontal: 12,
    marginRight: 0,
  },
  filterButtonLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  menu: {
    elevation: 4,
    borderRadius: 4,
  },
  exportMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    minWidth: 200,
  },
  transactionList: {
    flex: 1,
    marginTop: 8,
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  account: {
    fontSize: 12,
  },
  accountType: {
    fontSize: 12,
    opacity: 0.8,
  },
  amountContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
  exportButton: {
    margin: 0,
  },
  accountDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    height: 48,
    marginBottom: 8,
  },
  accountDropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountMenu: {
    elevation: 4,
    borderRadius: 4,
  },
});

export default TransactionsScreen; 