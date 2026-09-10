import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { gameEngine } from '../core/GameEngine';

interface EncyclopediaProps {
  discovered: string[];
  onClose: () => void;
}

export default function Encyclopedia({ discovered, onClose }: EncyclopediaProps) {
  const [search, setSearch] = useState('');
  
  const allElements = useMemo(() => gameEngine.registry.getAllElements(), []);
  const discoveredSet = useMemo(() => new Set(discovered), [discovered]);

  const [selectedId, setSelectedId] = useState<string>(() => {
    return discovered[0] || allElements[0]?.id || 'water';
  });

  const filteredElements = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allElements;
    return allElements.filter(el => el.name.toLowerCase().includes(query));
  }, [allElements, search]);

  const selectedElement = useMemo(() => {
    return gameEngine.registry.getElement(selectedId) || allElements[0];
  }, [allElements, selectedId]);

  const isSelectedDiscovered = selectedElement ? discoveredSet.has(selectedElement.id) : false;

  // 조합법 조회
  const recipes = useMemo(() => {
    if (!selectedElement) return [];
    return gameEngine.recipeBook.getRecipesFor(selectedElement.id);
  }, [selectedElement]);

  const isStarter = selectedElement ? gameEngine.isStarterElement(selectedElement.id) : false;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-5xl h-[88vh] flex flex-col bg-stone-50 border-stone-200 p-4 sm:p-6 overflow-hidden shadow-2xl">
        <DialogHeader className="shrink-0 pb-2 border-b border-stone-200/80">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>도감</span>
              <span className="text-xs font-normal text-stone-400">Encyclopedia</span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-stone-600 bg-stone-200/60 px-3 py-1 rounded-full">
              {discovered.length} / {allElements.length} 발견됨
            </span>
          </DialogTitle>
        </DialogHeader>
        
        {/* 메인 레이아웃: 좌측 그리드 + 우측 상세 정보 패널 */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden gap-4 pt-3">
          
          {/* 좌측: 원소 검색 및 그리드 목록 */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="pb-3 shrink-0">
              <Input 
                placeholder="원소 검색..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border-stone-200 h-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-1.5 overscroll-contain">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pb-4">
                {filteredElements.map(el => {
                  const isDiscovered = discoveredSet.has(el.id);
                  const isSelected = el.id === selectedId;

                  return (
                    <button
                      key={el.id}
                      type="button"
                      onClick={() => setSelectedId(el.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'ring-2 ring-stone-800 border-stone-800 bg-white shadow-md scale-102'
                          : isDiscovered
                          ? 'bg-white border-stone-200/90 shadow-xs hover:border-stone-400 hover:shadow'
                          : 'bg-stone-100/60 border-dashed border-stone-300 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1.5 ${
                        isDiscovered ? 'bg-stone-50 border border-stone-100' : 'bg-stone-200/50'
                      }`}>
                        <span className="text-2xl leading-none">{isDiscovered ? el.emoji : '❓'}</span>
                      </div>
                      <span className="text-xs font-medium text-stone-700 tracking-tight truncate max-w-[70px]">
                        {isDiscovered ? el.name : '미발견'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 우측: 선택된 원소 상세 정보 및 조합법 패널 */}
          <div className="w-full md:w-80 lg:w-96 bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col shrink-0 overflow-y-auto">
            {selectedElement ? (
              <div className="flex flex-col items-center text-center">
                {/* 원소 이모지 & 이름 */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 shadow-inner ${
                  isSelectedDiscovered ? 'bg-stone-50 border border-stone-100' : 'bg-stone-100 border border-stone-200'
                }`}>
                  <span className="text-5xl">{isSelectedDiscovered ? selectedElement.emoji : '❓'}</span>
                </div>
                
                <h3 className="text-xl font-bold text-stone-800 mb-1">
                  {isSelectedDiscovered ? selectedElement.name : '미발견 원소'}
                </h3>
                
                <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full mb-4">
                  {isSelectedDiscovered ? selectedElement.category.toUpperCase() : 'UNKNOWN'}
                </span>

                {/* 원소 설명 */}
                <div className="w-full bg-stone-50/80 border border-stone-100 p-3.5 rounded-xl text-left mb-4">
                  <span className="text-xs font-semibold text-stone-400 block mb-1">설명</span>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {isSelectedDiscovered 
                      ? (selectedElement.description || '신비로운 연금술 원소입니다.')
                      : '아직 발견되지 않은 원소입니다. 실험실 작업대에서 여러 원소를 조합해보세요!'}
                  </p>
                </div>

                {/* 조합법 (Recipe) */}
                <div className="w-full text-left">
                  <span className="text-xs font-semibold text-stone-400 block mb-2">조합법 (Recipe)</span>
                  
                  {!isSelectedDiscovered ? (
                    <div className="bg-stone-50 border border-dashed border-stone-200 p-3.5 rounded-xl text-center text-stone-400 text-xs flex items-center justify-center gap-1.5">
                      <span>🔒</span>
                      <span>원소를 먼저 발견해야 조합법이 공개됩니다.</span>
                    </div>
                  ) : isStarter ? (
                    <div className="bg-amber-50/60 border border-amber-200/70 p-3 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                      <span className="text-base">🌱</span>
                      <span>기본 4대 원소 (별도의 조합 없이 주어집니다)</span>
                    </div>
                  ) : recipes.length > 0 ? (
                    <div className="space-y-2">
                      {recipes.map(([ing1, ing2], idx) => {
                        const el1 = gameEngine.registry.getElement(ing1);
                        const el2 = gameEngine.registry.getElement(ing2);
                        const isIng1Discovered = discoveredSet.has(ing1);
                        const isIng2Discovered = discoveredSet.has(ing2);

                        return (
                          <div key={idx} className="bg-stone-50 border border-stone-200/80 p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-stone-700">
                              <span className="text-base">{isIng1Discovered ? el1?.emoji : '❓'}</span>
                              <span>{isIng1Discovered ? el1?.name : '미발견'}</span>
                            </div>
                            <span className="text-stone-400 font-bold">+</span>
                            <div className="flex items-center gap-1.5 font-medium text-stone-700">
                              <span className="text-base">{isIng2Discovered ? el2?.emoji : '❓'}</span>
                              <span>{isIng2Discovered ? el2?.name : '미발견'}</span>
                            </div>
                            <span className="text-stone-400 font-bold">=</span>
                            <div className="flex items-center gap-1 font-semibold text-emerald-700">
                              <span className="text-base">{selectedElement.emoji}</span>
                              <span>{selectedElement.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs text-stone-500">
                      알려진 조합법이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
