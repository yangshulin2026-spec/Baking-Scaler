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

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  baseYield: number;
  targetYield: number;
  ingredients: Ingredient[];
  updatedAt: number;
}

const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'default-1',
    name: '吐司面包 (Toast Bread)',
    baseYield: 2,
    targetYield: 1,
    ingredients: [
      { id: '1', name: '面粉 (Flour)', amount: 100, unit: 'g' },
      { id: '2', name: '黄油 (Butter)', amount: 50, unit: 'g' },
      { id: '3', name: '鸡蛋 (Eggs)', amount: 5, unit: '个' },
    ],
    updatedAt: Date.now()
  },
  {
    id: 'default-2',
    name: '巧克力曲奇 (Choco Cookie)',
    baseYield: 12,
    targetYield: 6,
    ingredients: [
      { id: 'c1', name: '低筋面粉', amount: 200, unit: 'g' },
      { id: 'c2', name: '巧克力豆', amount: 80, unit: 'g' },
      { id: 'c3', name: '黄油', amount: 100, unit: 'g' },
    ],
    updatedAt: Date.now()
  }
];

export default function App() {
  // Initialize with DEFAULT_RECIPES to prevent blank screen on first render
  const [recipes, setRecipes] = useState<Recipe[]>(DEFAULT_RECIPES);
  const [currentRecipeId, setCurrentRecipeId] = useState<string>(DEFAULT_RECIPES[0].id);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load recipes from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('baking-scaler-library-v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecipes(parsed);
          setCurrentRecipeId(parsed[0].id);
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
    return recipes.find(r => r.id === currentRecipeId) || recipes[0] || DEFAULT_RECIPES[0];
  }, [recipes, currentRecipeId]);

  const updateCurrentRecipe = (updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => 
      r.id === currentRecipeId ? { ...r, ...updates, updatedAt: Date.now() } : r
    ));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    const newIngredients = currentRecipe.ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    );
    updateCurrentRecipe({ ingredients: newIngredients });
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: generateId(),
      name: '',
      amount: 0,
      unit: 'g',
    };
    updateCurrentRecipe({ ingredients: [...currentRecipe.ingredients, newIngredient] });
  };

  const removeIngredient = (id: string) => {
    updateCurrentRecipe({ 
      ingredients: currentRecipe.ingredients.filter(ing => ing.id !== id) 
    });
  };

  const createNewRecipe = () => {
    const newRecipe: Recipe = {
      id: generateId(),
      name: '新配方 (New Recipe)',
      baseYield: 1,
      targetYield: 1,
      ingredients: [],
      updatedAt: Date.now()
    };
    setRecipes(prev => [newRecipe, ...prev]);
    setCurrentRecipeId(newRecipe.id);
    setIsLibraryOpen(false);
  };

  const deleteRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (recipes.length <= 1) {
      alert('至少需要保留一个配方。');
      return;
    }
    if (confirm('确定要删除这个配方吗？')) {
      const newRecipes = recipes.filter(r => r.id !== id);
      setRecipes(newRecipes);
      if (currentRecipeId === id) {
        setCurrentRecipeId(newRecipes[0].id);
      }
    }
  };

  const scaleFactor = useMemo(() => {
    if (!currentRecipe || currentRecipe.baseYield <= 0) return 0;
    return currentRecipe.targetYield / currentRecipe.baseYield;
  }, [currentRecipe]);

  const copyToClipboard = () => {
    if (!currentRecipe) return;
    const text = `
【烘焙配方】: ${currentRecipe.name}
--------------------------
原份数: ${currentRecipe.baseYield} -> 目标份数: ${currentRecipe.targetYield}
换算比例: ${scaleFactor.toFixed(2)}

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
    <div className="min-h-screen bg-[#F8F5F2] text-[#2D241E] font-sans selection:bg-[#D4C3B3] flex">
      {/* Sidebar Library */}
      <AnimatePresence>
        {isLibraryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLibraryOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-80 bg-white border-r border-[#E6D5B8] z-50 flex flex-col shadow-2xl lg:relative lg:shadow-none"
            >
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
                      setIsLibraryOpen(false);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCurrentRecipeId(recipe.id);
                        setIsLibraryOpen(false);
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
                      "text-[10px] mt-1 uppercase tracking-wider font-bold",
                      currentRecipeId === recipe.id ? "text-white/60" : "text-[#D4C3B3]"
                    )}>
                      {recipe.ingredients.length} 种材料
                    </div>
                    
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {currentRecipeId !== recipe.id && (
                        <button 
                          onClick={(e) => deleteRecipe(recipe.id, e)}
                          className="p-2 text-[#D4C3B3] hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                          title="删除配方"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <ChevronRight size={16} className={cn(
                        "transition-transform",
                        currentRecipeId === recipe.id ? "text-white" : "text-[#D4C3B3] group-hover:translate-x-1"
                      )} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[#F0E6D2]">
                <button 
                  onClick={createNewRecipe}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#FAF7F2] border-2 border-dashed border-[#E6D5B8] rounded-2xl text-[#8B5E3C] font-bold hover:bg-[#F5F1E9] transition-colors"
                >
                  <Plus size={18} /> 新建配方
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
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
            <div className="flex gap-3">
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

        <main className="max-w-2xl mx-auto p-4 md:p-8 w-full">
          {/* Main Recipe Card */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-[#E6D5B8] overflow-hidden print:shadow-none print:border-none">
            {/* Card Header: Recipe Name */}
            <div className="bg-[#5C4033] p-8 text-white text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                <Utensils size={12} />
                Recipe Card
              </div>
              <input 
                type="text" 
                value={currentRecipe.name}
                onChange={(e) => updateCurrentRecipe({ name: e.target.value })}
                className="w-full text-3xl font-black bg-transparent text-center outline-none border-b-2 border-transparent focus:border-white/30 transition-all placeholder:text-white/50"
                placeholder="输入配方名称"
              />
            </div>

            {/* Yield Controls */}
            <div className="p-8 border-b border-[#F0E6D2] bg-[#FAF7F2]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2 text-center md:text-left">
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-[0.2em]">原始份数 (Base)</label>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <input 
                      type="number" 
                      value={currentRecipe.baseYield}
                      onChange={(e) => updateCurrentRecipe({ baseYield: Number(e.target.value) })}
                      className="w-16 text-2xl font-bold bg-white border border-[#E6D5B8] rounded-xl px-2 py-1 text-center focus:ring-2 focus:ring-[#5C4033] outline-none"
                    />
                    <span className="font-bold text-[#5C4033]">条/个</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="bg-[#5C4033] text-white p-2 rounded-full shadow-lg">
                    <ArrowRight size={20} />
                  </div>
                </div>

                <div className="space-y-2 text-center md:text-right">
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-[0.2em]">目标份数 (Target)</label>
                  <div className="flex items-center justify-center md:justify-end gap-2">
                    <input 
                      type="number" 
                      value={currentRecipe.targetYield}
                      onChange={(e) => updateCurrentRecipe({ targetYield: Number(e.target.value) })}
                      className="w-16 text-2xl font-bold bg-white border border-[#E6D5B8] rounded-xl px-2 py-1 text-center focus:ring-2 focus:ring-[#5C4033] outline-none"
                    />
                    <span className="font-bold text-[#5C4033]">条/个</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6D5B8]/30 rounded-full border border-[#E6D5B8]">
                  <Scale size={16} className="text-[#5C4033]" />
                  <span className="text-sm font-bold text-[#5C4033]">
                    换算比例: <span className="text-lg">{scaleFactor.toFixed(2)}x</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#5C4033] flex items-center gap-2">
                  材料清单
                  <span className="text-xs font-normal text-[#8B5E3C] bg-[#F0E6D2] px-2 py-0.5 rounded-md">Ingredients</span>
                </h2>
                <button 
                  onClick={addIngredient}
                  className="flex items-center gap-1 text-sm font-bold text-[#5C4033] hover:bg-[#F0E6D2] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#E6D5B8]"
                >
                  <Plus size={16} /> 添加
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {currentRecipe.ingredients.map((ing, idx) => (
                    <motion.div 
                      key={ing.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-[#F0E6D2] hover:border-[#D4C3B3] hover:bg-[#FAF7F2] transition-all"
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-xs font-bold text-[#D4C3B3] w-4">{idx + 1}.</span>
                        <input 
                          type="text" 
                          value={ing.name}
                          onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                          placeholder="材料名称"
                          className="flex-1 bg-transparent font-bold text-[#5C4033] outline-none border-b border-transparent focus:border-[#D4C3B3] py-1"
                        />
                      </div>

                      <div className="flex items-center gap-4 justify-between md:justify-end">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={ing.amount}
                            onChange={(e) => updateIngredient(ing.id, 'amount', Number(e.target.value))}
                            className="w-20 bg-white border border-[#E6D5B8] rounded-lg px-2 py-1 text-right font-bold outline-none focus:ring-2 focus:ring-[#5C4033]"
                          />
                          <input 
                            type="text" 
                            value={ing.unit}
                            onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                            className="w-12 bg-transparent text-sm font-medium text-[#8B5E3C] outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-[#5C4033] rounded-xl text-white min-w-[110px] justify-center shadow-md">
                          <span className="text-[10px] font-bold opacity-70">需:</span>
                          <span className="text-lg font-black">
                            {(ing.amount * scaleFactor).toFixed(1)}
                          </span>
                          <span className="text-xs opacity-80">{ing.unit}</span>
                        </div>

                        <button 
                          onClick={() => removeIngredient(ing.id)}
                          className="p-2 text-[#D4C3B3] hover:text-red-400 transition-colors"
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
            <div className="p-8 bg-[#FAF7F2] border-t border-[#F0E6D2] flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-xs text-[#A89078] font-medium italic">
                * 换算结果会自动保存到您的配方库中。
              </p>
              <button 
                onClick={copyToClipboard}
                className={cn(
                  "w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black transition-all shadow-lg active:scale-95",
                  copied 
                    ? "bg-green-500 text-white" 
                    : "bg-[#5C4033] text-white hover:bg-[#4A3329]"
                )}
              >
                {copied ? <ClipboardCheck size={20} /> : <Copy size={20} />}
                <span>{copied ? '已复制配方' : '复制完整配方'}</span>
              </button>
            </div>
          </div>

          <footer className="mt-12 text-center space-y-2 pb-12">
            <div className="flex justify-center gap-4 text-[#A89078]">
              <ChefHat size={16} />
              <Scale size={16} />
              <Utensils size={16} />
            </div>
            <p className="text-[10px] font-black text-[#D4C3B3] uppercase tracking-[0.3em]">
              Professional Baking Scaler v3.0
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
