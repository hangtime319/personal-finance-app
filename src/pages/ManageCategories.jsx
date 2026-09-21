import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
const COLOR_PALETTE = ['#4ade80', '#38bdf8', '#a855f7', '#fb7185', '#fbbf24'];

export default function ManageCategories() {
  const navigate = useNavigate();
  const { categories, addCategory, updateCategory, deleteCategory } = useTransactions();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_PALETTE[0]);
  
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryColor, setEditingCategoryColor] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addCategory({ 
        name: newCategoryName, 
        icon: 'label', 
        color: newCategoryColor 
      });
      setNewCategoryName('');
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar categoria.');
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete);
    } catch (error) {
      console.error(error);
      alert('Não é possível excluir uma categoria que já possui lançamentos vinculados.');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const startEditing = (cat) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
    setEditingCategoryColor(cat.color || COLOR_PALETTE[0]);
  };

  const handleSaveEdit = async (id) => {
    if (!editingCategoryName.trim()) return;
    try {
      await updateCategory(id, { name: editingCategoryName, color: editingCategoryColor });
      setEditingCategoryId(null);
      setEditingCategoryName('');
      setEditingCategoryColor('');
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar categoria.');
    }
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
    setEditingCategoryColor('');
  };

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex justify-center selection:bg-primary-container selection:text-on-primary-container">
      <div className="w-full max-w-lg bg-surface-container-lowest min-h-screen flex flex-col relative overflow-hidden shadow-2xl">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        {/* TopAppBar */}
        <header className="fixed top-0 left-0 w-full z-40 bg-surface-container/95 backdrop-blur-md shadow-sm border-b border-outline-variant/30 max-w-lg mx-auto left-1/2 -translate-x-1/2">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="w-11 flex items-center justify-start">
              <button onClick={() => navigate('/')} aria-label="Voltar" className="w-11 h-11 flex items-center justify-center rounded-xl text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95" type="button">
                <span className="material-symbols-outlined text-on-surface">arrow_back</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="text-headline-sm font-headline-sm text-on-surface tracking-tight">Categorias</h1>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">{categories?.length || 0} categorias ativas</span>
              </div>
            </div>
            
            <div className="w-11 flex items-center justify-end"></div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pt-20 pb-28 px-4 no-scrollbar">
          {/* Quick Add Section */}
          <section className="mt-2 mb-6 bg-surface-container rounded-2xl p-4 border border-outline-variant/30 shadow-md relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-label-md font-label-md text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                Criar Nova Categoria
              </span>
              <span className="text-label-sm font-label-sm text-outline">Atalho Rápido</span>
            </div>
            
            <form className="flex items-center gap-2" onSubmit={handleAddCategory}>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-lg">label</span>
                </div>
                <input 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full h-13 pl-10 pr-3 py-3 bg-surface-container-low text-on-surface text-body-md font-body-md placeholder-outline-variant rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                  placeholder="Nome da nova categoria..." 
                  type="text" 
                />
              </div>
              <button aria-label="Adicionar Categoria" className="w-13 h-13 min-w-[52px] min-h-[52px] bg-primary text-on-primary rounded-xl flex items-center justify-center font-label-md font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all" type="submit">
                <span className="material-symbols-outlined font-bold text-2xl">add</span>
              </button>
            </form>
            
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-outline-variant/20 overflow-x-auto no-scrollbar">
              <span className="text-label-sm font-label-sm text-outline shrink-0">Paleta sugerida:</span>
              <div className="flex items-center gap-1.5">
                {COLOR_PALETTE.map((color) => (
                  <button 
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded-full ring-2 transition-all ${newCategoryColor === color ? 'ring-white scale-110' : 'ring-transparent hover:ring-white/50'}`} 
                    type="button"
                  ></button>
                ))}
              </div>
            </div>
          </section>

          {/* Categories List */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-label-md font-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Categorias Cadastradas</h2>
            <span className="text-body-sm font-body-sm text-outline">Toque para gerenciar</span>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {categories?.map((cat) => {
              const isEditing = editingCategoryId === cat.id;

              if (isEditing) {
                return (
                  <article key={cat.id} className="bg-surface-container-high rounded-2xl p-3 border-2 border-primary shadow-lg ring-4 ring-primary/10 relative">
                    <div className="flex items-center justify-between gap-2 min-h-[44px]">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${editingCategoryColor || '#64748b'}20`, color: editingCategoryColor || '#64748b', border: `1px solid ${editingCategoryColor || '#64748b'}30` }}>
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon || 'label'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="sr-only" htmlFor={`edit-category-${cat.id}`}>Editar Nome da Categoria</label>
                        <input 
                          id={`edit-category-${cat.id}`}
                          autoFocus 
                          className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface text-body-lg font-headline-sm rounded-xl border border-primary text-primary-fixed-dim focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold transition-all" 
                          type="text" 
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleSaveEdit(cat.id)} aria-label="Salvar alteração" className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-primary-container/20 text-primary hover:bg-primary-container hover:text-on-primary-container flex items-center justify-center transition-all active:scale-90 border border-primary/30" type="button">
                          <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </button>
                        <button onClick={cancelEditing} aria-label="Cancelar edição" className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-secondary-container/20 text-error hover:bg-secondary-container hover:text-on-secondary-container flex items-center justify-center transition-all active:scale-90 border border-error/30" type="button">
                          <span className="material-symbols-outlined text-2xl font-bold">close</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pl-14">
                      {COLOR_PALETTE.map((color) => (
                        <button 
                          key={color}
                          onClick={() => setEditingCategoryColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-6 h-6 rounded-full ring-2 transition-all ${editingCategoryColor === color ? 'ring-white scale-110' : 'ring-transparent hover:ring-white/50'}`} 
                          type="button"
                        ></button>
                      ))}
                    </div>

                    <div className="mt-2 pl-14 flex items-center gap-1.5 text-label-sm font-label-sm text-primary">
                      <span className="material-symbols-outlined text-xs">info</span>
                      <span>Editando categoria no momento</span>
                    </div>
                  </article>
                );
              }

              return (
                <article key={cat.id} className="bg-surface-container rounded-2xl p-3.5 border border-outline-variant/20 flex items-center justify-between shadow-sm transition-all hover:border-outline-variant/50">
                  <div className="flex items-center gap-3 min-h-[44px]">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color || '#64748b'}15`, color: cat.color || '#64748b', border: `1px solid ${cat.color || '#64748b'}25` }}>
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon || 'label'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-body-lg font-headline-sm text-on-surface leading-tight">{cat.name}</span>
                      <span className="text-body-sm font-body-sm text-on-surface-variant">Personalizada</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditing(cat)} aria-label={`Editar ${cat.name}`} className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95" type="button">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onClick={() => setCategoryToDelete(cat.id)} aria-label={`Excluir ${cat.name}`} className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-error hover:bg-error-container/20 transition-colors active:scale-95" type="button">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 mb-4 text-center">
            <p className="text-body-sm font-body-sm text-outline">
              As categorias organizam relatórios e limites mensais.
            </p>
          </div>
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-lg mx-auto bg-surface-container-low/90 backdrop-blur-md shadow-lg border-t border-outline-variant/30">
          <Link to="/" className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1.5 transition-all hover:text-on-surface active:scale-95">
            <span className="material-symbols-outlined text-2xl">dashboard</span>
            <span className="text-label-sm font-label-sm mt-0.5">Início</span>
          </Link>
          <Link to="/extrato" className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1.5 transition-all hover:text-on-surface active:scale-95">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
            <span className="text-label-sm font-label-sm mt-0.5">Extrato</span>
          </Link>
          <Link to="/relatorios" className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1.5 transition-all hover:text-on-surface active:scale-95">
            <span className="material-symbols-outlined text-2xl">pie_chart</span>
            <span className="text-label-sm font-label-sm mt-0.5">Relatórios</span>
          </Link>
          <Link to="/perfil" className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1.5 transition-all hover:text-on-surface active:scale-95">
            <span className="material-symbols-outlined text-2xl">person</span>
            <span className="text-label-sm font-label-sm mt-0.5">Perfil</span>
          </Link>
        </nav>
        {/* Delete Confirmation Modal */}
        {categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-surface-container-high rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-outline-variant/20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
              <div className="w-14 h-14 rounded-full bg-error-container/30 text-error flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">delete</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-2">Excluir Categoria</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                Tem certeza que deseja excluir esta categoria? Esta ação não poderá ser desfeita.
              </p>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setCategoryToDelete(null)}
                  className="flex-1 h-12 rounded-xl bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80 font-label-lg font-semibold transition-colors active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 h-12 rounded-xl bg-error text-on-error hover:brightness-110 font-label-lg font-semibold transition-all shadow-sm active:scale-95"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
