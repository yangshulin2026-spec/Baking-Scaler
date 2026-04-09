/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  ChefHat, 
  Scale, 
  Copy, 
  ClipboardCheck,
  ArrowRight,
  Printer,
  Utensils,
  BookOpen,
  Search,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple ID generator for better compatibility
const generateId = () => Math.random().toString(36).substring(2, 11);

const COMMON_INGREDIENTS = [
  { name: '面粉', unit: 'g' },
  { name: '细砂糖', unit: 'g' },
  { name: '黄油', unit: 'g' },
  { name: '鸡蛋', unit: '个' },
  { name: '牛奶', unit: 'ml' },
  { name: '淡奶油', unit: 'g' },
  { name: '水', unit: 'ml' },
  { name: '酵母', unit: 'g' },
  { name: '盐', unit: 'g' },
  { name: '泡打粉', unit: 'g' },
  { name: '可可粉', unit: 'g' },
  { name: '香草精', unit: '小勺' },
];

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  yieldName: string; // e.g., "条", "个", "份"
  baseYield: number; // Quantity
  baseSize: number;  // Size per unit (e.g., 450)
  targetYield: number;
  targetSize: number;
  sizeUnit: string;  // e.g., "g", "ml", "寸"
  ingredients: Ingredient[];
  updatedAt: number;
}

const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'shokupan',
    name: '招牌生吐司',
    yieldName: '条',
    baseYield: 1,
    baseSize: 450,
    targetYield: 1,
    targetSize: 450,
    sizeUnit: 'g',
    ingredients: [
      { id: 's1', name: '高筋面粉', amount: 250, unit: 'g' },
      { id: 's2', name: '细砂糖', amount: 20, unit: 'g' },
      { id: 's3', name: '盐', amount: 5, unit: 'g' },
      { id: 's4', name: '耐高糖酵母', amount: 3, unit: 'g' },
      { id: 's5', name: '全蛋液', amount: 25, unit: 'g' },
      { id: 's6', name: '牛奶', amount: 160, unit: 'g' },
      { id: 's7', name: '淡奶油', amount: 30, unit: 'g' },
      { id: 's8', name: '无盐黄油', amount: 20, unit: 'g' },
    ],
    updatedAt: Date.now()
  },
  {
    id: 'basque',
    name: '巴斯克芝士蛋糕',
    yieldName: '个',
    baseYield: 1,
    baseSize: 6,
    targetYield: 1,
    targetSize: 6,
    sizeUnit: '寸',
    ingredients: [
      { id: 'b1', name: '奶油芝士', amount: 350, unit: 'g' },
      { id: 'b2', name: '细砂糖', amount: 80, unit: 'g' },
      { id: 'b3', name: '鸡蛋', amount: 3, unit: '个' },
      { id: 'b4', name: '淡奶油', amount: 180, unit: 'g' },
      { id: 'b5', name: '低筋面粉', amount: 10, unit: 'g' },
      { id: 'b6', name: '香草精', amount: 2, unit: 'g' },
    ],
    updatedAt: Date.now()
  },
  {
    id: 'bagel',
    name: '全麦贝果',
    yieldName: '个',
    baseYield: 6,
    baseSize: 80,
    targetYield: 6,
    targetSize: 80,
    sizeUnit: 'g',
    ingredients: [
      { id: 'bg1', name: '高筋面粉', amount: 200, unit: 'g' },
      { id: 'bg2', name: '全麦面粉', amount: 100, unit: 'g' },
      { id: 'bg3', name: '冰水', amount: 185, unit: 'g' },
      { id: 'bg4', name: '盐', amount: 5, unit: 'g' },
      { id: 'bg5', name: '干酵母', amount: 3, unit: 'g' },
      { id: 'bg6', name: '糖', amount: 10, unit: 'g' },
    ],
    updatedAt: Date.now()
  },
  {
    id: 'cookie',
    name: '海盐巧克力曲奇',
    yieldName: '份',
    baseYield: 1,
    baseSize: 15,
    targetYield: 1,
    targetSize: 15,
    sizeUnit: '块',
    ingredients: [
      { id: 'c1', name: '无盐黄油', amount: 110, unit: 'g' },
      { id: 'c2', name: '红糖', amount: 80, unit: 'g' },
      { id: 'c3', name: '细砂糖', amount: 40, unit: 'g' },
      { id: 'c4', name: '全蛋', amount: 50, unit: 'g' },
      { id: 'c5', name: '中筋面粉', amount: 180, unit: 'g' },
      { id: 'c6', name: '可可粉', amount: 15, unit: 'g' },
      { id: 'c7', name: '小苏打', amount: 2, unit: 'g' },
      { id: 'c8', name: '巧克力豆', amount: 100, unit: 'g' },
    ],
    updatedAt: Date.now()
  }
];

export default function App() {
  // Initialize with DEFAULT_RECIPES to prevent blank screen on first render
  const [recipes, setRecipes] = useState<Recipe[]>(DEFAULT_RECIPES);
  const [currentRecipeId, setCurrentRecipeId] = useState<string>(DEFAULT_RECIPES[0].id);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isIngredientPickerOpen, setIsIngredientPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load recipes from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('baking-scaler-library-v3');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Data Migration: Strip English names and handle new yieldName field
          const migrated = parsed.map((recipe: any) => ({
            ...recipe,
            name: recipe.name.replace(/\s*\(.*\)$/, '').trim(),
            yieldName: recipe.yieldName?.includes('/') ? recipe.yieldName.split('/')[1] : (recipe.yieldName || '份'),
            baseSize: recipe.baseSize || (recipe.yieldName?.includes('/') ? parseFloat(recipe.yieldName) : 1),
            targetSize: recipe.targetSize || (recipe.yieldName?.includes('/') ? parseFloat(recipe.yieldName) : 1),
            sizeUnit: recipe.sizeUnit || (recipe.yieldName?.includes('寸') ? '寸' : 'g'),
            ingredients: recipe.ingredients.map((ing: any) => ({
              ...ing,
              name: ing.name.replace(/\s*\(.*\)$/, '').trim()
            }))
          }));
          setRecipes(migrated);
          setCurrentRecipeId(migrated[0].id);
        } else {
          // If empty array, keep defaults
          setRecipes(DEFAULT_RECIPES);
          setCurrentRecipeId(DEFAULT_RECIPES[0].id);
        }
      } catch (e) {
        console.error('Failed to parse saved recipes', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save recipes to local storage whenever they change
  useEffect(() => {
    if (isLoaded && recipes.length > 0) {
      localStorage.setItem('baking-scaler-library-v3', JSON.stringify(recipes));
    }
  }, [recipes, isLoaded]);

  const currentRecipe = useMemo(() => {
    return recipes.find(r => r.id === currentRecipeId) || recipes[0] || null;
  }, [recipes, currentRecipeId]);

  const updateCurrentRecipe = (updates: Partial<Recipe>) => {
    if (!currentRecipe) return;
    
    // Ensure numeric values are non-negative
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.baseYield !== undefined) {
      sanitizedUpdates.baseYield = Math.max(0, Number(sanitizedUpdates.baseYield) || 0);
    }
    if (sanitizedUpdates.targetYield !== undefined) {
      sanitizedUpdates.targetYield = Math.max(0, Number(sanitizedUpdates.targetYield) || 0);
    }
    if (sanitizedUpdates.baseSize !== undefined) {
      sanitizedUpdates.baseSize = Math.max(0, Number(sanitizedUpdates.baseSize) || 0);
    }
    if (sanitizedUpdates.targetSize !== undefined) {
      sanitizedUpdates.targetSize = Math.max(0, Number(sanitizedUpdates.targetSize) || 0);
    }

    setRecipes(prev => prev.map(r => 
      r.id === currentRecipeId ? { ...r, ...sanitizedUpdates, updatedAt: Date.now() } : r
    ));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    if (!currentRecipe) return;
    
    let sanitizedValue = value;
    if (field === 'amount') {
      sanitizedValue = Math.max(0, Number(value) || 0);
    }

    const newIngredients = currentRecipe.ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: sanitizedValue } : ing
    );
    updateCurrentRecipe({ ingredients: newIngredients });
  };

  const addIngredient = (name = '', unit = 'g') => {
    const newIngredient: Ingredient = {
      id: generateId(),
      name,
      amount: 0,
      unit,
    };
    updateCurrentRecipe({ ingredients: [...currentRecipe.ingredients, newIngredient] });
    setIsIngredientPickerOpen(false);
  };

  const removeIngredient = (id: string) => {
    updateCurrentRecipe({ 
      ingredients: currentRecipe.ingredients.filter(ing => ing.id !== id) 
    });
  };

  const createNewRecipe = () => {
    const newRecipe: Recipe = {
      id: generateId(),
      name: '新配方',
      yieldName: '份',
      baseYield: 1,
      baseSize: 1,
      targetYield: 1,
      targetSize: 1,
      sizeUnit: 'g',
      ingredients: [],
      updatedAt: Date.now()
    };
    setRecipes(prev => [newRecipe, ...prev]);
    setCurrentRecipeId(newRecipe.id);
    setIsLibraryOpen(false);
    showToast('已创建新配方草稿', 'info');
  };

  const [isSaving, setIsSaving] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveRecipeManually = () => {
    setIsSaving(true);
    // The actual saving happens via useEffect, we just provide visual feedback
    setTimeout(() => {
      setIsSaving(false);
      showToast('配方已成功保存至配方库');
    }, 800);
  };

  const deleteRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecipeToDelete(id);
  };

  const confirmDelete = () => {
    if (!recipeToDelete) return;
    const newRecipes = recipes.filter(r => r.id !== recipeToDelete);
    setRecipes(newRecipes);
    if (currentRecipeId === recipeToDelete) {
      setCurrentRecipeId(newRecipes.length > 0 ? newRecipes[0].id : '');
    }
    setRecipeToDelete(null);
  };

  const restoreDefaults = () => {
    if (window.confirm('确定要恢复默认配方吗？这不会删除您自己创建的配方，但会将默认配方重新添加到库中。')) {
      const existingIds = new Set(recipes.map(r => r.id));
      const toAdd = DEFAULT_RECIPES.filter(r => !existingIds.has(r.id));
      if (toAdd.length === 0) {
        showToast('默认配方已在库中', 'info');
        return;
      }
      setRecipes(prev => [...prev, ...toAdd]);
      showToast(`已恢复 ${toAdd.length} 个默认配方`);
    }
  };

  const scaleFactor = useMemo(() => {
    if (!currentRecipe) return 0;
    const baseTotal = currentRecipe.baseYield * currentRecipe.baseSize;
    const targetTotal = currentRecipe.targetYield * currentRecipe.targetSize;
    if (baseTotal <= 0) return 0;
    return targetTotal / baseTotal;
  }, [currentRecipe]);

  const copyToClipboard = () => {
    if (!currentRecipe) return;
    const text = `
【烘焙配方】: ${currentRecipe.name}
--------------------------
换算方案: 
原配方: ${currentRecipe.baseYield}${currentRecipe.yieldName} (单份 ${currentRecipe.baseSize}${currentRecipe.sizeUnit})
目标: ${currentRecipe.targetYield}${currentRecipe.yieldName} (单份 ${currentRecipe.targetSize}${currentRecipe.sizeUnit})
换算比例: ${scaleFactor.toFixed(2)}x

材料清单 (换算后):
${currentRecipe.ingredients.map(ing => {
  const scaled = (ing.amount * scaleFactor).toFixed(1);
  return `• ${ing.name}: ${scaled}${ing.unit} (原始: ${ing.amount}${ing.unit})`;
}).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden bg-[#F8F5F2] text-[#2D241E] font-sans selection:bg-[#D4C3B3] flex">
      {/* Modals */}
      <AnimatePresence>
        {recipeToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRecipeToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#5C4033]">确认删除？</h3>
                <p className="text-[#8B5E3C] mt-2">删除后配方将无法找回。</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setRecipeToDelete(null)}
                  className="flex-1 py-3 bg-[#FAF7F2] text-[#8B5E3C] font-bold rounded-xl hover:bg-[#F5F1E9] transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  确定删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Library */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 px-6 py-3 bg-[#5C4033] text-white rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            {toast.type === 'success' ? (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Plus size={12} className="rotate-45" />
              </div>
            ) : (
              <BookOpen size={18} className="text-[#E6D5B8]" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Library */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-80 bg-white border-r border-[#E6D5B8] z-50 flex flex-col shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none",
        isLibraryOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-[#F0E6D2] flex items-center justify-between">
          <h2 className="text-xl font-black text-[#5C4033] flex items-center gap-2">
            <BookOpen size={20} /> 配方库
          </h2>
          <button onClick={() => setIsLibraryOpen(false)} className="lg:hidden p-1 hover:bg-[#F5F1E9] rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4C3B3]" size={16} />
            <input 
              type="text" 
              placeholder="搜索配方..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E6D5B8] rounded-xl outline-none focus:ring-2 focus:ring-[#5C4033] text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => {
                setCurrentRecipeId(recipe.id);
                if (window.innerWidth < 1024) setIsLibraryOpen(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentRecipeId(recipe.id);
                  if (window.innerWidth < 1024) setIsLibraryOpen(false);
                }
              }}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all group relative cursor-pointer outline-none focus:ring-2 focus:ring-[#5C4033] focus:ring-offset-2",
                currentRecipeId === recipe.id 
                  ? "bg-[#5C4033] border-[#5C4033] text-white shadow-lg" 
                  : "bg-white border-[#F0E6D2] hover:border-[#D4C3B3] text-[#5C4033]"
              )}
            >
              <div className="font-bold truncate pr-8">{recipe.name}</div>
              <div className={cn(
                "text-[10px] mt-1 uppercase tracking-wider font-bold flex items-center gap-2",
                currentRecipeId === recipe.id ? "text-white/60" : "text-[#D4C3B3]"
              )}>
                <span>{recipe.ingredients.length} 种材料</span>
                <span>•</span>
                <span>{recipe.baseYield}{recipe.yieldName} × {recipe.baseSize}{recipe.sizeUnit}</span>
              </div>
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button 
                  onClick={(e) => deleteRecipe(recipe.id, e)}
                  className={cn(
                    "p-2 transition-all rounded-full",
                    currentRecipeId === recipe.id 
                      ? "text-white/40 hover:text-white hover:bg-white/10" 
                      : "text-[#D4C3B3] hover:text-red-500 hover:bg-red-50"
                  )}
                  title="删除配方"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} className={cn(
                  "transition-transform",
                  currentRecipeId === recipe.id ? "text-white" : "text-[#D4C3B3] group-hover:translate-x-1"
                )} />
              </div>
            </div>
          ))}
          
          {filteredRecipes.length === 0 && (
            <div className="text-center py-8 px-4 border-2 border-dashed border-[#E6D5B8] rounded-2xl">
              <p className="text-xs text-[#A89078] font-medium">未找到匹配配方</p>
              <button 
                onClick={restoreDefaults}
                className="mt-2 text-[10px] font-bold text-[#5C4033] underline"
              >
                恢复默认配方
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#F0E6D2] space-y-2">
          <button 
            onClick={createNewRecipe}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FAF7F2] border-2 border-dashed border-[#E6D5B8] rounded-2xl text-[#8B5E3C] font-bold hover:bg-[#F5F1E9] transition-colors"
          >
            <Plus size={18} /> 新建配方
          </button>
          <button 
            onClick={restoreDefaults}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-[#A89078] hover:text-[#5C4033] transition-colors"
          >
            <RotateCcw size={12} /> 恢复默认配方
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isLibraryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLibraryOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Header Area */}
        <header className="bg-white border-b border-[#E6D5B8] py-4 px-6 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsLibraryOpen(true)}
                className="p-2 bg-[#FAF7F2] border border-[#E6D5B8] rounded-lg text-[#5C4033] hover:bg-[#F5F1E9] transition-colors"
                title="打开配方库"
              >
                <BookOpen size={20} />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight text-[#5C4033]">烘焙换算助手</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={createNewRecipe}
                className="flex items-center gap-2 px-4 py-2 bg-[#5C4033] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#4A3329] transition-all active:scale-95"
              >
                <Plus size={18} />
                <span>新建配方</span>
              </button>
              <button 
                onClick={() => window.print()}
                className="p-2 text-[#8B5E3C] hover:bg-[#F5F1E9] rounded-full transition-colors"
                title="打印"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-3 md:p-8 w-full">
          {currentRecipe ? (
            /* Main Recipe Card */
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-[#E6D5B8] overflow-hidden print:shadow-none print:border-none">
              {/* Card Header: Recipe Name */}
              <div className="bg-[#5C4033] p-6 md:p-8 text-white text-center space-y-2">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <Utensils size={12} />
                    配方卡片
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-md text-[9px] font-black text-green-300 uppercase tracking-tighter">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                    已录入配方库
                  </div>
                </div>
                <input 
                  type="text" 
                  value={currentRecipe.name}
                  onChange={(e) => updateCurrentRecipe({ name: e.target.value })}
                  className="w-full text-2xl md:text-3xl font-black bg-transparent text-center outline-none border-b-2 border-transparent focus:border-white/30 transition-all placeholder:text-white/50"
                  placeholder="输入配方名称"
                />
              </div>

              {/* Yield Controls */}
              <div className="p-6 md:p-8 border-b border-[#F0E6D2] bg-[#FAF7F2]">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Base Side */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-[0.2em]">原始配方规格</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center bg-white border border-[#E6D5B8] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#5C4033]">
                          <input 
                            type="number" 
                            min="0"
                            value={currentRecipe.baseYield}
                            onChange={(e) => updateCurrentRecipe({ baseYield: Number(e.target.value) })}
                            className="w-full text-lg font-bold bg-transparent outline-none"
                          />
                          <input 
                            type="text" 
                            value={currentRecipe.yieldName}
                            onChange={(e) => updateCurrentRecipe({ yieldName: e.target.value })}
                            placeholder="条"
                            className="w-8 text-xs font-bold text-[#8B5E3C] bg-transparent border-l border-[#E6D5B8] ml-2 pl-2 outline-none"
                          />
                        </div>
                        <p className="text-[9px] text-[#A89078] font-bold text-center">数量</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center bg-white border border-[#E6D5B8] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#5C4033]">
                          <input 
                            type="number" 
                            min="0"
                            value={currentRecipe.baseSize}
                            onChange={(e) => updateCurrentRecipe({ baseSize: Number(e.target.value) })}
                            className="w-full text-lg font-bold bg-transparent outline-none"
                          />
                          <input 
                            type="text" 
                            value={currentRecipe.sizeUnit}
                            onChange={(e) => updateCurrentRecipe({ sizeUnit: e.target.value })}
                            placeholder="g"
                            className="w-8 text-xs font-bold text-[#8B5E3C] bg-transparent border-l border-[#E6D5B8] ml-2 pl-2 outline-none"
                          />
                        </div>
                        <p className="text-[9px] text-[#A89078] font-bold text-center">单份规格</p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#5C4033] text-white p-2 rounded-full shadow-lg rotate-90 md:rotate-0">
                      <ArrowRight size={18} />
                    </div>
                    <div className="mt-2 text-[10px] font-black text-[#5C4033] bg-[#E6D5B8] px-2 py-0.5 rounded uppercase">换算</div>
                  </div>

                  {/* Target Side */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-[0.2em]">目标制作规格</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center bg-white border border-[#E6D5B8] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#5C4033]">
                          <input 
                            type="number" 
                            min="0"
                            value={currentRecipe.targetYield}
                            onChange={(e) => updateCurrentRecipe({ targetYield: Number(e.target.value) })}
                            className="w-full text-lg font-bold bg-transparent outline-none"
                          />
                          <span className="text-xs font-bold text-[#8B5E3C] ml-2 pl-2 border-l border-[#E6D5B8]">{currentRecipe.yieldName}</span>
                        </div>
                        <p className="text-[9px] text-[#A89078] font-bold text-center">数量</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center bg-white border border-[#E6D5B8] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#5C4033]">
                          <input 
                            type="number" 
                            min="0"
                            value={currentRecipe.targetSize}
                            onChange={(e) => updateCurrentRecipe({ targetSize: Number(e.target.value) })}
                            className="w-full text-lg font-bold bg-transparent outline-none"
                          />
                          <span className="text-xs font-bold text-[#8B5E3C] ml-2 pl-2 border-l border-[#E6D5B8]">{currentRecipe.sizeUnit}</span>
                        </div>
                        <p className="text-[9px] text-[#A89078] font-bold text-center">单份规格</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#5C4033] rounded-full shadow-xl border border-[#4A3329]">
                    <Scale size={16} className="text-[#E6D5B8]" />
                    <span className="text-sm font-bold text-white">
                      换算比例: <span className="text-xl text-[#E6D5B8]">{scaleFactor.toFixed(2)}x</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8B5E3C] font-bold opacity-60">
                    总重: {currentRecipe.baseYield * currentRecipe.baseSize}{currentRecipe.sizeUnit} → {currentRecipe.targetYield * currentRecipe.targetSize}{currentRecipe.sizeUnit}
                  </p>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="p-4 md:p-8 space-y-6">
                <div className="flex items-center justify-between relative">
                  <h2 className="text-lg md:text-xl font-black text-[#5C4033] flex items-center gap-2">
                    材料清单
                  </h2>
                  <div className="relative">
                    <button 
                      onClick={() => setIsIngredientPickerOpen(!isIngredientPickerOpen)}
                      className="flex items-center gap-1 text-xs md:text-sm font-bold text-[#5C4033] bg-[#F0E6D2] hover:bg-[#E6D5B8] px-3 md:px-4 py-2 rounded-xl transition-all border border-[#E6D5B8] shadow-sm"
                    >
                      <Plus size={14} /> 添加材料
                    </button>

                    <AnimatePresence>
                      {isIngredientPickerOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-64 bg-white border border-[#E6D5B8] rounded-2xl shadow-2xl z-30 overflow-hidden"
                        >
                          <div className="p-3 bg-[#FAF7F2] border-b border-[#E6D5B8] text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest">
                            常用材料快速选择
                          </div>
                          <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-2 gap-1">
                            <button 
                              onClick={() => addIngredient('', 'g')}
                              className="col-span-2 flex items-center gap-2 p-2 hover:bg-[#F5F1E9] rounded-lg text-left text-sm font-bold text-[#5C4033] border border-dashed border-[#E6D5B8] mb-1"
                            >
                              <Plus size={14} /> 自定义材料
                            </button>
                            {COMMON_INGREDIENTS.map(item => (
                              <button
                                key={item.name}
                                onClick={() => addIngredient(item.name, item.unit)}
                                className="p-2 hover:bg-[#F5F1E9] rounded-lg text-left text-xs font-medium text-[#5C4033] transition-colors"
                              >
                                {item.name.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <AnimatePresence mode="popLayout">
                    {currentRecipe.ingredients.map((ing, idx) => (
                      <motion.div 
                        key={ing.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative flex flex-col gap-3 p-3 md:p-4 rounded-2xl border border-[#F0E6D2] hover:border-[#D4C3B3] hover:bg-[#FAF7F2] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-[#D4C3B3] w-4">{idx + 1}.</span>
                          <input 
                            type="text" 
                            value={ing.name}
                            onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                            placeholder="材料名称"
                            className="flex-1 bg-transparent font-bold text-[#5C4033] outline-none border-b border-transparent focus:border-[#D4C3B3] py-1 text-sm md:text-base"
                          />
                          <button 
                            onClick={() => removeIngredient(ing.id)}
                            className="md:hidden p-2 text-[#D4C3B3] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 justify-between">
                          <div className="flex items-center gap-1 md:gap-2">
                            <input 
                              type="number" 
                              min="0"
                              value={ing.amount || ''}
                              onChange={(e) => updateIngredient(ing.id, 'amount', Math.max(0, Number(e.target.value)))}
                              placeholder="0"
                              className="w-16 md:w-20 bg-white border border-[#E6D5B8] rounded-lg px-2 py-1 text-right font-bold outline-none focus:ring-2 focus:ring-[#5C4033] text-sm"
                            />
                            <input 
                              type="text" 
                              value={ing.unit}
                              onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                              className="w-10 md:w-12 bg-transparent text-xs font-medium text-[#8B5E3C] outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#5C4033] rounded-xl text-white min-w-[80px] md:min-w-[110px] justify-center shadow-md">
                            <span className="text-[9px] md:text-[10px] font-bold opacity-70">需:</span>
                            <span className="text-sm md:text-lg font-black">
                              {(ing.amount * scaleFactor).toFixed(1)}
                            </span>
                            <span className="text-[10px] opacity-80">{ing.unit}</span>
                          </div>

                          <button 
                            onClick={() => removeIngredient(ing.id)}
                            className="hidden md:block p-2 text-[#D4C3B3] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {currentRecipe.ingredients.length === 0 && (
                  <div className="text-center py-16 border-2 border-dashed border-[#E6D5B8] rounded-[2rem]">
                    <p className="text-[#A89078] font-medium">还没有添加材料，点击上方“添加”开始吧！</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 md:p-8 bg-[#FAF7F2] border-t border-[#F0E6D2] flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col gap-1 w-full sm:w-auto text-center sm:text-left">
                  <p className="text-[10px] md:text-xs text-[#A89078] font-medium italic">
                    * 换算结果会自动实时保存。
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-bold text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    已实时同步至本地
                  </div>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={saveRecipeManually}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#5C4033] text-[#5C4033] rounded-2xl font-black text-sm md:text-base hover:bg-[#5C4033] hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    {isSaving ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Save size={18} />
                        </motion.div>
                        <span>入库中...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>保存入库</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className={cn(
                      "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-2xl font-black text-sm md:text-base transition-all shadow-lg active:scale-95",
                      copied 
                        ? "bg-green-500 text-white" 
                        : "bg-[#5C4033] text-white hover:bg-[#4A3329]"
                    )}
                  >
                    {copied ? <ClipboardCheck size={18} /> : <Copy size={18} />}
                    <span>{copied ? '已复制' : '复制配方'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 px-6 bg-white rounded-[2rem] border-2 border-dashed border-[#E6D5B8]">
              <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-[#D4C3B3]" />
              </div>
              <h2 className="text-2xl font-black text-[#5C4033] mb-2">配方库空空如也</h2>
              <p className="text-[#8B5E3C] mb-8">点击下方按钮或左侧菜单创建您的第一个烘焙配方</p>
              <button 
                onClick={createNewRecipe}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#5C4033] text-white font-black rounded-2xl shadow-xl hover:bg-[#4A3329] transition-all active:scale-95"
              >
                <Plus size={20} /> 立即创建新配方
              </button>
            </div>
          )}

          <footer className="mt-12 text-center space-y-2 pb-12">
            <div className="flex justify-center gap-4 text-[#A89078]">
              <ChefHat size={16} />
              <Scale size={16} />
              <Utensils size={16} />
            </div>
            <p className="text-[10px] font-black text-[#D4C3B3] uppercase tracking-[0.3em]">
              专业烘焙换算器 v3.0
            </p>
          </footer>
        </main>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white; }
          header, footer, button, aside, .no-print { display: none !important; }
          main { padding: 0; max-width: 100%; margin: 0; }
          .bg-[#5C4033] { background-color: #5C4033 !important; -webkit-print-color-adjust: exact; }
          .text-white { color: white !important; }
        }
      `}</style>
    </div>
  );
}
