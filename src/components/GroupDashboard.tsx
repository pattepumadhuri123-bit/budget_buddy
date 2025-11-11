import { useState, useEffect } from 'react';
import { X, Plus, ArrowLeft, TrendingUp, Users, DollarSign, Calendar, Upload } from 'lucide-react';
import { supabase, type GroupMember, type Expense } from '../lib/supabase';
import { UploadBillModal } from './UploadBillModal';

type GroupDashboardProps = {
  groupId: string;
  groupCode: string;
  groupName: string;
  onClose: () => void;
};

export function GroupDashboard({ groupId, groupCode, groupName, onClose }: GroupDashboardProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showUploadBill, setShowUploadBill] = useState(false);
  const [newExpense, setNewExpense] = useState({
    member_id: '',
    description: '',
    amount: '',
    category: 'Groceries',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      const [membersRes, expensesRes] = await Promise.all([
        supabase.from('group_members').select('*').eq('group_id', groupId),
        supabase.from('expenses').select('*').eq('group_id', groupId).order('date', { ascending: false })
      ]);

      if (membersRes.data) setMembers(membersRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newExpense.member_id || !newExpense.description || !newExpense.amount) {
      return;
    }

    try {
      const { error } = await supabase.from('expenses').insert({
        group_id: groupId,
        member_id: newExpense.member_id,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date
      });

      if (error) throw error;

      setNewExpense({
        member_id: '',
        description: '',
        amount: '',
        category: 'Groceries',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddExpense(false);
      loadData();
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const getMemberExpenses = (memberId: string) => {
    return expenses
      .filter(e => e.member_id === memberId)
      .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);

  const categories = ['Groceries', 'Utilities', 'Internet', 'Rent', 'Entertainment', 'Travel', 'Food', 'Other'];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Group Code</div>
                  <div className="text-orange-400 font-mono font-bold text-lg">{groupCode}</div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{groupName}</h1>
            <p className="text-gray-400">Manage your group expenses and track spending</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <DollarSign className="w-6 h-6 text-orange-400" />
                <span className="text-gray-300">Total Expenses</span>
              </div>
              <div className="text-3xl font-bold text-white">${totalExpenses.toFixed(2)}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="w-6 h-6 text-purple-400" />
                <span className="text-gray-300">Group Members</span>
              </div>
              <div className="text-3xl font-bold text-white">{members.length}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <span className="text-gray-300">Total Transactions</span>
              </div>
              <div className="text-3xl font-bold text-white">{expenses.length}</div>
            </div>
          </div>

          {/* Expense Table */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Expense Tracking Table</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadBill(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 font-medium transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Bill</span>
                </button>
                <button
                  onClick={() => setShowAddExpense(!showAddExpense)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/50 rounded-lg text-white font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>

            {showAddExpense && (
              <form onSubmit={addExpense} className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Member *</label>
                    <select
                      value={newExpense.member_id}
                      onChange={(e) => setNewExpense({ ...newExpense, member_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      required
                    >
                      <option value="">Select member</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Category *</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-400"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Description *</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      placeholder="e.g., Weekly groceries"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Amount ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Date *</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg text-white font-medium hover:shadow-lg transition-all"
                    >
                      Add Expense
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Expense Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Member Name</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Budget Category</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Description</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Date</th>
                    <th className="text-right py-4 px-4 text-gray-400 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        No expenses yet. Click "Add Expense" to get started!
                      </td>
                    </tr>
                  ) : (
                    expenses.map(expense => {
                      const member = members.find(m => m.id === expense.member_id);
                      return (
                        <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {member?.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{member?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{expense.description}</td>
                          <td className="py-4 px-4 text-gray-300">
                            {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-orange-400 font-bold text-lg">${parseFloat(expense.amount.toString()).toFixed(2)}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {expenses.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-orange-400/30">
                      <td colSpan={4} className="py-4 px-4 text-white font-bold text-lg">Total</td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-orange-400 font-bold text-2xl">${totalExpenses.toFixed(2)}</span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Members Summary</h2>
              </div>

              <div className="space-y-3">
                {members.map(member => {
                  const memberTotal = getMemberExpenses(member.id);
                  const memberExpenseCount = expenses.filter(e => e.member_id === member.id).length;
                  return (
                    <div key={member.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{member.name}</div>
                            {member.email && <div className="text-gray-400 text-sm">{member.email}</div>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-400 font-bold text-xl">${memberTotal.toFixed(2)}</div>
                          <div className="text-gray-400 text-sm">
                            {memberExpenseCount} {memberExpenseCount === 1 ? 'expense' : 'expenses'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Category Breakdown</h2>
              </div>

              <div className="space-y-3">
                {categories.map(category => {
                  const categoryExpenses = expenses.filter(e => e.category === category);
                  const categoryTotal = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);

                  if (categoryTotal === 0) return null;

                  const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;

                  return (
                    <div key={category} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{category}</span>
                        <span className="text-orange-400 font-bold">${categoryTotal.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                        <span>{categoryExpenses.length} {categoryExpenses.length === 1 ? 'transaction' : 'transactions'}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <UploadBillModal
        isOpen={showUploadBill}
        onClose={() => setShowUploadBill(false)}
        groupId={groupId}
        members={members}
        onSuccess={() => {
          setShowUploadBill(false);
          loadData();
        }}
      />
    </div>
  );
}
