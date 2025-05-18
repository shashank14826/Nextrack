import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { accountApi, transactionApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { subMonths } from 'date-fns';

// API URL - using localhost for iOS simulator and IP address for Android
const API_URL = Platform.OS === 'ios' 
  ? 'http://localhost:5001/api'
  : 'http://192.168.135.50:5001/api';

const DashboardScreen = () => {
  const theme = useTheme();
  
  // State for accounts and loading
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Form states
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Category states
  const [incomeCategory, setIncomeCategory] = useState('Salary');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [incomeCategoryDropdownVisible, setIncomeCategoryDropdownVisible] = useState(false);
  const [expenseCategoryDropdownVisible, setExpenseCategoryDropdownVisible] = useState(false);
  const [accountTypeDropdownVisible, setAccountTypeDropdownVisible] = useState(false);
  
  // Account type options
  const accountTypes = ['Savings', 'Current', 'Investment', 'Credit Card', 'Cash'];
  
  // Income and expense categories
  const incomeCategories = ['Salary', 'Investment', 'Interest', 'Gift', 'Bonus', 'Refund', 'Other'];
  const expenseCategories = ['Food', 'Transport', 'Housing', 'Utilities', 'Insurance', 'Healthcare', 
    'Shopping', 'Entertainment', 'Travel', 'Education', 'Personal Care', 'Debt', 'Other'];

  const accountButtonRef = useRef(null);
  const [accountMenuPosition, setAccountMenuPosition] = useState({ x: 0, y: 0 });
  const accountTypeButtonRef = useRef(null);
  const [accountTypeMenuPosition, setAccountTypeMenuPosition] = useState({ x: 0, y: 0 });
  const incomeCategoryButtonRef = useRef(null);
  const [incomeCategoryMenuPosition, setIncomeCategoryMenuPosition] = useState({ x: 0, y: 0 });
  const expenseCategoryButtonRef = useRef(null);
  const [expenseCategoryMenuPosition, setExpenseCategoryMenuPosition] = useState({ x: 0, y: 0 });

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const accountsData = await accountApi.getAccounts();
      setAccounts(accountsData);
      if (accountsData.length > 0 && !selectedAccount) {
        setSelectedAccount(accountsData[0]);
      }
    } catch (err) {
      setError('Failed to fetch accounts');
      Alert.alert('Error', 'Failed to fetch accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalVisible(true);
    setAccountName('');
    setAccountType('Savings');
    setAmount('');
    setDescription('');
    setDate(new Date());
    setIncomeCategory('Salary');
    setExpenseCategory('Food');
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIncomeCategoryDropdownVisible(false);
    setExpenseCategoryDropdownVisible(false);
    setAccountTypeDropdownVisible(false);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleAddAccount = async () => {
    if (!accountName.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }
    
    try {
      setLoading(true);
      const newAccount = await accountApi.createAccount({
        name: accountName,
        type: accountType
      });
      
      setAccounts([...accounts, newAccount]);
      setSelectedAccount(newAccount);
      handleCloseModal();
    } catch (err) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account');
      return;
    }
    
    try {
      setLoading(true);
      const transactionData = {
        accountId: selectedAccount._id,
        type: 'income',
        amount: parseFloat(amount),
        category: incomeCategory,
        description: description.trim() || `${incomeCategory} income`,
        date: date
      };
      
      const result = await transactionApi.createTransaction(transactionData);
      
      // Update accounts with new balance
      const updatedAccounts = accounts.map(account => {
        if (account._id === selectedAccount._id) {
          return {
            ...account,
            balance: result.updatedBalance,
            income: account.income + parseFloat(amount)
          };
        }
        return account;
      });
      
      setAccounts(updatedAccounts);
      setSelectedAccount(updatedAccounts.find(account => account._id === selectedAccount._id));
      handleCloseModal();
    } catch (err) {
      Alert.alert('Error', 'Failed to add income. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account');
      return;
    }
    
    try {
      setLoading(true);
      const transactionData = {
        accountId: selectedAccount._id,
        type: 'expense',
        amount: parseFloat(amount),
        category: expenseCategory,
        description: description.trim() || `${expenseCategory} expense`,
        date: date
      };
      
      const result = await transactionApi.createTransaction(transactionData);
      
      // Update accounts with new balance
      const updatedAccounts = accounts.map(account => {
        if (account._id === selectedAccount._id) {
          return {
            ...account,
            balance: result.updatedBalance,
            expense: account.expense + parseFloat(amount)
          };
        }
        return account;
      });
      
      setAccounts(updatedAccounts);
      setSelectedAccount(updatedAccounts.find(account => account._id === selectedAccount._id));
      handleCloseModal();
    } catch (err) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAccountPress = () => {
    if (accountButtonRef.current) {
      accountButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setAccountMenuPosition({ x: pageX, y: pageY + height });
        setDropdownVisible(true);
      });
    }
  };

  const handleAccountTypePress = () => {
    if (accountTypeButtonRef.current) {
      accountTypeButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setAccountTypeMenuPosition({ x: pageX, y: pageY + height });
        setAccountTypeDropdownVisible(true);
      });
    }
  };

  const handleIncomeCategoryPress = () => {
    if (incomeCategoryButtonRef.current) {
      incomeCategoryButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setIncomeCategoryMenuPosition({ x: pageX, y: pageY + height });
        setIncomeCategoryDropdownVisible(true);
      });
    }
  };

  const handleExpenseCategoryPress = () => {
    if (expenseCategoryButtonRef.current) {
      expenseCategoryButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setExpenseCategoryMenuPosition({ x: pageX, y: pageY + height });
        setExpenseCategoryDropdownVisible(true);
      });
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading accounts...</Text>
      </View>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchAccounts}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setDropdownVisible(false);
      setAccountTypeDropdownVisible(false);
      setIncomeCategoryDropdownVisible(false);
      setExpenseCategoryDropdownVisible(false);
    }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          {/* Account Selection Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              ref={accountButtonRef}
              style={[styles.dropdown, { backgroundColor: theme.colors.surface }]}
              onPress={handleAccountPress}
            >
              <Text style={[styles.dropdownText, { color: theme.colors.onSurface }]}>
                {selectedAccount?.name || 'Select Account'}
              </Text>
              <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.onSurface} />
            </TouchableOpacity>
            
            {dropdownVisible && (
              <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.surface }]}>
                {accounts.map(account => (
                  <TouchableOpacity 
                    key={account._id}
                    style={[styles.dropdownItem, { borderBottomColor: theme.colors.surfaceVariant }]}
                    onPress={() => {
                      setSelectedAccount(account);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.onSurface }]}>{account.name}</Text>
                    <Text style={[styles.dropdownItemType, { color: theme.colors.onSurfaceVariant }]}>{account.type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Account Balance Card */}
          {selectedAccount && (
            <View style={[styles.balanceCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.balanceLabel, { color: theme.colors.onSurfaceVariant }]}>Balance</Text>
              <Text style={[styles.balanceAmount, { color: theme.colors.onSurface }]}>${selectedAccount.balance.toFixed(2)}</Text>
              
              <View style={styles.statContainer}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Income</Text>
                  <Text style={styles.incomeAmount}>${selectedAccount.income.toFixed(2)}</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Expense</Text>
                  <Text style={styles.expenseAmount}>${selectedAccount.expense.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.incomeButton]}
              onPress={() => handleOpenModal('income')}
            >
              <Ionicons name="arrow-down" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Add Income</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.expenseButton]}
              onPress={() => handleOpenModal('expense')}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleOpenModal('account')}
            >
              <Ionicons name="wallet-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Modal for adding income, expense, or account */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                      {modalType === 'income' ? 'Add Income' : 
                       modalType === 'expense' ? 'Add Expense' : 'Add New Account'}
                    </Text>
                    <TouchableOpacity onPress={handleCloseModal}>
                      <Ionicons name="close" size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                  </View>
                  
                  {modalType === 'account' && (
                    <View style={styles.modalForm}>
                      <TextInput
                        style={styles.input}
                        placeholder="Account Name"
                        value={accountName}
                        onChangeText={setAccountName}
                      />
                      
                      <View style={styles.dropdownContainer}>
                        <TouchableOpacity 
                          style={styles.dropdownInput}
                          onPress={() => setAccountTypeDropdownVisible(!accountTypeDropdownVisible)}
                        >
                          <Text style={styles.dropdownInputText}>{accountType}</Text>
                          <Ionicons 
                            name={accountTypeDropdownVisible ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color="#333" 
                          />
                        </TouchableOpacity>
                        
                        {accountTypeDropdownVisible && (
                          <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.surface }]}>
                            {accountTypes.map(type => (
                              <TouchableOpacity 
                                key={type}
                                style={[styles.dropdownItem, { borderBottomColor: theme.colors.surfaceVariant }]}
                                onPress={() => {
                                  setAccountType(type);
                                  setAccountTypeDropdownVisible(false);
                                }}
                              >
                                <Text style={[styles.dropdownItemText, { color: theme.colors.onSurface }]}>
                                  {type}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={handleAddAccount}
                      >
                        <Text style={styles.saveButtonText}>Add Account</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {modalType === 'income' && (
                    <View style={styles.modalForm}>
                      <Text style={styles.selectedAccountText}>
                        Account: {selectedAccount?.name}
                      </Text>
                      
                      <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                      />
                      
                      <View style={styles.dropdownContainer}>
                        <TouchableOpacity 
                          style={styles.dropdownInput}
                          onPress={() => setIncomeCategoryDropdownVisible(!incomeCategoryDropdownVisible)}
                        >
                          <Text style={styles.dropdownInputText}>{incomeCategory}</Text>
                          <Ionicons 
                            name={incomeCategoryDropdownVisible ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color="#333" 
                          />
                        </TouchableOpacity>
                        
                        {incomeCategoryDropdownVisible && (
                          <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.surface }]}>
                            {incomeCategories.map(category => (
                              <TouchableOpacity 
                                key={category}
                                style={[styles.dropdownItem, { borderBottomColor: theme.colors.surfaceVariant }]}
                                onPress={() => {
                                  setIncomeCategory(category);
                                  setIncomeCategoryDropdownVisible(false);
                                }}
                              >
                                <Text style={[styles.dropdownItemText, { color: theme.colors.onSurface }]}>
                                  {category}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                      
                      <TextInput
                        style={styles.input}
                        placeholder="Description (Optional)"
                        value={description}
                        onChangeText={setDescription}
                      />
                      
                      <TouchableOpacity 
                        style={styles.dateInput}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={styles.dateInputText}>Date: {formatDate(date)}</Text>
                        <Ionicons name="calendar-outline" size={20} color="#333" />
                      </TouchableOpacity>
                      
                      {showDatePicker && (
                        <DateTimePicker
                          value={date}
                          mode="date"
                          display="default"
                          onChange={handleDateChange}
                        />
                      )}
                      
                      <TouchableOpacity 
                        style={[styles.saveButton, styles.incomeButton]}
                        onPress={handleAddIncome}
                      >
                        <Text style={styles.saveButtonText}>Add Income</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {modalType === 'expense' && (
                    <View style={styles.modalForm}>
                      <Text style={styles.selectedAccountText}>
                        Account: {selectedAccount?.name}
                      </Text>
                      
                      <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                      />
                      
                      <View style={styles.dropdownContainer}>
                        <TouchableOpacity 
                          style={styles.dropdownInput}
                          onPress={() => setExpenseCategoryDropdownVisible(!expenseCategoryDropdownVisible)}
                        >
                          <Text style={styles.dropdownInputText}>{expenseCategory}</Text>
                          <Ionicons 
                            name={expenseCategoryDropdownVisible ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color="#333" 
                          />
                        </TouchableOpacity>
                        
                        {expenseCategoryDropdownVisible && (
                          <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.surface }]}>
                            {expenseCategories.map(category => (
                              <TouchableOpacity 
                                key={category}
                                style={[styles.dropdownItem, { borderBottomColor: theme.colors.surfaceVariant }]}
                                onPress={() => {
                                  setExpenseCategory(category);
                                  setExpenseCategoryDropdownVisible(false);
                                }}
                              >
                                <Text style={[styles.dropdownItemText, { color: theme.colors.onSurface }]}>
                                  {category}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                      
                      <TextInput
                        style={styles.input}
                        placeholder="Description (Optional)"
                        value={description}
                        onChangeText={setDescription}
                      />
                      
                      <TouchableOpacity 
                        style={styles.dateInput}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={styles.dateInputText}>Date: {formatDate(date)}</Text>
                        <Ionicons name="calendar-outline" size={20} color="#333" />
                      </TouchableOpacity>
                      
                      {showDatePicker && (
                        <DateTimePicker
                          value={date}
                          mode="date"
                          display="default"
                          onChange={handleDateChange}
                        />
                      )}
                      
                      <TouchableOpacity 
                        style={[styles.saveButton, styles.expenseButton]}
                        onPress={handleAddExpense}
                      >
                        <Text style={styles.saveButtonText}>Add Expense</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdownItemType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    gap: 15,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeButton: {
    backgroundColor: '#4CAF50',
  },
  expenseButton: {
    backgroundColor: '#F44336',
  },
  accountButton: {
    backgroundColor: '#4361ee',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalForm: {
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  dropdownInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
    zIndex: 1,
  },
  dropdownInputText: {
    fontSize: 16,
  },
  selectedAccountText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  dateInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateInputText: {
    fontSize: 16,
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#4361ee',
    alignItems: 'center',
    marginTop: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4361ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen; 