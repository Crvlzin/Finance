import type { Category } from '@/types'

/**
 * Categorias padrão do sistema para classificação inicial de receitas e despesas
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Salário & Proventos', color: '#10B981', icon: 'Briefcase', type: 'income' },
  { id: 'cat-2', name: 'Investimentos & Dividendos', color: '#06B6D4', icon: 'TrendingUp', type: 'income' },
  { id: 'cat-3', name: 'Outras Receitas & Pix', color: '#14B8A6', icon: 'ArrowDownLeft', type: 'income' },
  { id: 'cat-4', name: 'Moradia (Aluguel & Contas)', color: '#F43F5E', icon: 'Home', type: 'expense', monthlyBudget: 0 },
  { id: 'cat-5', name: 'Alimentação & Mercado', color: '#F97316', icon: 'ShoppingBag', type: 'expense', monthlyBudget: 0 },
  { id: 'cat-6', name: 'Transporte & Combustível', color: '#EAB308', icon: 'Car', type: 'expense', monthlyBudget: 0 },
  { id: 'cat-7', name: 'Lazer & Restaurantes', color: '#8B5CF6', icon: 'Utensils', type: 'expense', monthlyBudget: 0 },
  { id: 'cat-8', name: 'Saúde & Farmácia', color: '#EC4899', icon: 'HeartPulse', type: 'expense', monthlyBudget: 0 },
  { id: 'cat-9', name: 'Educação & Cursos', color: '#3B82F6', icon: 'GraduationCap', type: 'expense', monthlyBudget: 0 },
  { id: 'cat-10', name: 'Compras & E-commerce', color: '#F43F5E', icon: 'ShoppingBag', type: 'expense', monthlyBudget: 0 },
  { id: 'cat-11', name: 'Transferências & Pessoal', color: '#6366F1', icon: 'Send', type: 'expense', monthlyBudget: 0 },
  { id: 'cat-12', name: 'Pagamento de Fatura & Cartão', color: '#E11D48', icon: 'CreditCard', type: 'expense', monthlyBudget: 0 },
]
