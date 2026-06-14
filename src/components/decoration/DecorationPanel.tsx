import { useMemo } from 'react';
import {
  Sticker,
  Flower2,
  Stamp,
  Gift,
  CornerDownRight,
  Trash2,
  Layers,
  TextCursor,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { decorationPresets, decorationCategories } from '@/constants/decorationPresets';
import type { DecorationCategory } from '@/types';

const iconMap: Record<DecorationCategory, typeof Sticker> = {
  tape: TextCursor,
  sticker: Sticker,
  flower: Flower2,
  stamp: Stamp,
  corner: CornerDownRight,
  ribbon: Gift,
};

export default function DecorationPanel() {
  const {
    decorationCategory,
    setDecorationCategory,
    selectedDecorationId,
    setSelectedDecorationId,
    setIsPlacingDecoration,
    setIsPlacingSignature,
    setSelectedSignatureId,
    setIsPlacingStamp,
    setSelectedStampId,
    setIsAnnotating,
    setIsDirectSigning,
    decorationPlacements,
    currentPage,
    clearPageDecorations,
    clearAllDecorations,
  } = useWorkspaceStore();

  const filteredDecorations = useMemo(
    () => decorationPresets.filter((d) => d.category === decorationCategory),
    [decorationCategory],
  );

  const pageDecorationCount = useMemo(
    () => decorationPlacements.filter((d) => d.pageIndex === currentPage - 1).length,
    [decorationPlacements, currentPage],
  );

  const handleSelectDecoration = (id: string) => {
    if (selectedDecorationId === id) {
      setSelectedDecorationId(null);
      setIsPlacingDecoration(false);
    } else {
      setSelectedSignatureId(null);
      setIsPlacingSignature(false);
      setSelectedStampId(null);
      setIsPlacingStamp(false);
      setIsAnnotating(false);
      setIsDirectSigning(false);
      setSelectedDecorationId(id);
      setIsPlacingDecoration(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-amber-600" />
          装饰元素
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {decorationCategories.map((cat) => {
            const Icon = iconMap[cat.id];
            const isActive = decorationCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setDecorationCategory(cat.id)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium',
                  'flex items-center gap-1',
                  'transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-700',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-2.5">
          {filteredDecorations.map((deco) => {
            const isSelected = selectedDecorationId === deco.id;
            return (
              <button
                key={deco.id}
                onClick={() => handleSelectDecoration(deco.id)}
                className={cn(
                  'relative group aspect-square',
                  'p-2 rounded-xl',
                  'border-2 transition-all duration-200',
                  'hover:shadow-md hover:-translate-y-0.5',
                  'flex items-center justify-center',
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 shadow-sm shadow-amber-100'
                    : 'border-stone-200 bg-white hover:border-amber-300',
                )}
                title={deco.name}
              >
                {isSelected && (
                  <div
                    className={cn(
                      'absolute top-1 right-1',
                      'w-4 h-4 rounded-full',
                      'bg-gradient-to-br from-amber-500 to-orange-600',
                      'flex items-center justify-center',
                      'shadow-sm',
                    )}
                  >
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: deco.svgContent }}
                />
              </button>
            );
          })}
        </div>
        <SelectedDecorationHint />
      </div>

      <div className="p-4 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-stone-500">
            本页装饰：<span className="text-amber-700 font-bold">{pageDecorationCount}</span> 个
          </span>
          <span className="text-xs text-stone-400">共 {decorationPlacements.length} 个</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => clearPageDecorations(currentPage - 1)}
            disabled={pageDecorationCount === 0}
            className={cn(
              'flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium',
              'flex items-center justify-center gap-1',
              'transition-all duration-200',
              pageDecorationCount === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700',
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空本页
          </button>
          <button
            onClick={clearAllDecorations}
            disabled={decorationPlacements.length === 0}
            className={cn(
              'flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium',
              'flex items-center justify-center gap-1',
              'transition-all duration-200',
              decorationPlacements.length === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700',
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空全部
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectedDecorationHint() {
  const { selectedDecorationId, isPlacingDecoration } = useWorkspaceStore();
  if (!selectedDecorationId || !isPlacingDecoration) return null;

  return (
    <div className="mt-3 col-span-3">
      <div
        className={cn(
          'px-3 py-2 rounded-lg',
          'bg-amber-50 border border-amber-200',
          'flex items-center justify-between',
        )}
      >
        <span className="text-xs font-medium text-amber-800">点击信纸放置装饰</span>
        <button
          onClick={() => {
            const { setSelectedDecorationId, setIsPlacingDecoration } =
              useWorkspaceStore.getState();
            setSelectedDecorationId(null);
            setIsPlacingDecoration(false);
          }}
          className="p-0.5 rounded text-amber-600 hover:bg-amber-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
