
import React, { useState } from 'react';
import { ChefHat, Plus, Sparkles, Wand2, RefreshCcw, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { generateRecipe, generateInitialImage, editImageWithPrompt } from './services/geminiService';
import { Recipe } from './types';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const newRecipe = await generateRecipe(ingredients);
      setRecipe(newRecipe);
      const initialImg = await generateInitialImage(newRecipe.title);
      setImageUrl(initialImg);
    } catch (err) {
      console.error(err);
      setError("레시피를 생성하지 못했습니다. 재료를 다시 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!editPrompt.trim() || !imageUrl) return;
    
    setIsEditing(true);
    setError(null);
    try {
      const updatedImg = await editImageWithPrompt(imageUrl, editPrompt);
      setImageUrl(updatedImg);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      setError("이미지를 수정하지 못했습니다. 요청이 너무 복잡할 수 있습니다.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    setRecipe(null);
    setImageUrl(null);
    setIngredients('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-orange-500 p-2 rounded-lg">
              <ChefHat className="text-white h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">셰프 AI</h1>
          </div>
          {recipe && (
            <Button variant="ghost" onClick={handleReset} className="text-sm">
              <RefreshCcw className="h-4 w-4" />
              처음부터 다시하기
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {!recipe ? (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-900">냉장고에 무엇이 있나요?</h2>
              <p className="text-slate-500 text-lg">재료를 입력하면 AI가 당신만을 위한 특별한 미식 레시피와 시각 자료를 만들어 드립니다.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">사용 가능한 재료 (쉼표로 구분)</label>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="예: 닭가슴살, 생크림, 마늘, 시금치, 파마산 치즈, 올리브유..."
                  className="w-full h-32 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none text-slate-800"
                />
                <Button 
                  onClick={handleGenerate} 
                  isLoading={isLoading} 
                  className="w-full h-14 text-lg"
                  disabled={!ingredients.trim()}
                >
                  <Sparkles className="h-5 w-5" />
                  미식 레시피 생성하기
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 bg-orange-50 rounded-3xl space-y-3">
                <div className="bg-orange-200 w-10 h-10 rounded-full flex items-center justify-center">
                  <ChefHat className="text-orange-600 h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">스마트 레시피</h3>
                <p className="text-sm text-slate-600">가지고 계신 재료에 딱 맞춘 최적의 조리법을 제안합니다.</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-3xl space-y-3">
                <div className="bg-blue-200 w-10 h-10 rounded-full flex items-center justify-center">
                  <ImageIcon className="text-blue-600 h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">비주얼 스타일링</h3>
                <p className="text-sm text-slate-600">요리를 시작하기 전, 완성된 모습의 이미지를 미리 확인하세요.</p>
              </div>
              <div className="p-6 bg-purple-50 rounded-3xl space-y-3">
                <div className="bg-purple-200 w-10 h-10 rounded-full flex items-center justify-center">
                  <Wand2 className="text-purple-600 h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">매직 에디팅</h3>
                <p className="text-sm text-slate-600">간단한 텍스트로 완성 사진의 배경이나 분위기를 바꿔보세요.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* Recipe Content */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 text-orange-600 font-bold text-sm uppercase tracking-wider mb-2">
                  <ChefHat className="h-4 w-4" />
                  오늘의 레시피
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{recipe.title}</h2>
                <p className="text-slate-600 mb-6 leading-relaxed italic border-l-4 border-orange-200 pl-4">
                  "{recipe.description}"
                </p>
                
                <div className="flex gap-6 mb-8">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase">조리 시간</p>
                    <p className="text-lg font-bold text-slate-800">{recipe.prepTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase">인분</p>
                    <p className="text-lg font-bold text-slate-800">{recipe.servings}인분</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      필요한 재료
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-xl text-sm">
                          <Plus className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      조리 순서
                    </h3>
                    <ol className="space-y-6">
                      {recipe.instructions.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold shrink-0 text-sm">
                            {i + 1}
                          </span>
                          <p className="text-slate-700 leading-relaxed pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Visuals & Editing */}
            <div className="space-y-8 sticky top-24">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-blue-600 font-bold text-sm uppercase tracking-wider">
                    <ImageIcon className="h-4 w-4" />
                    요리 이미지 시각화
                  </div>
                  {isEditing && (
                    <span className="text-xs font-medium text-slate-400 animate-pulse">AI 수정 중...</span>
                  )}
                </div>
                
                <div className="relative group overflow-hidden rounded-2xl bg-slate-100 aspect-square">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={recipe.title} 
                      className={`w-full h-full object-cover transition-opacity duration-500 ${isEditing ? 'opacity-50' : 'opacity-100'}`} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <RefreshCcw className="h-8 w-8 text-slate-300 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-700">AI로 이미지 꾸미기</h4>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="'레트로 필터 추가', '대리석 식탁 위에 놓아줘' 등..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleEditImage()}
                    />
                    <Button 
                      onClick={handleEditImage} 
                      isLoading={isEditing} 
                      variant="secondary"
                      className="w-full"
                      disabled={!editPrompt.trim() || !imageUrl}
                    >
                      <Wand2 className="h-4 w-4" />
                      이미지에 효과 적용
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['흑백 필터', '시네마틱 조명', '현대적인 주방 배경', '배경 흐리게'].map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setEditPrompt(hint)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-medium transition-colors"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-orange-500" />
              <span className="text-white font-bold text-xl">셰프 AI</span>
            </div>
            <p className="text-sm">Powered by Gemini 3 Flash & 2.5 Flash Image</p>
            <div className="flex gap-6 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">문의하기</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
            &copy; 2024 Chef AI Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
