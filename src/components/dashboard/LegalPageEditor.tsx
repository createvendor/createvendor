'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  Plus, 
  GripVertical, 
  Loader2,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Type,
  Code,
  Minus,
  Table as TableIcon,
  Image as ImageIcon,
  Smile,
  Trash,
  Palette,
  ChevronRight,
  Columns,
  Rows,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Link2, Highlighter, Indent, Outdent
} from 'lucide-react';
import { Store } from '@/types';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const MenuItem = ({ icon, label, desc, shortcut, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  desc: string; 
  shortcut?: string; 
  onClick: () => void;
}) => (
  <button 
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left group"
  >
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold text-gray-700 leading-none">{label}</span>
        {shortcut && <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">{shortcut}</span>}
      </div>
      <p className="text-[10px] text-gray-400 font-medium leading-none mt-1 truncate">{desc}</p>
    </div>
  </button>
);

const ContextMenuItem = ({ icon, label, onClick, onMouseEnter, hasSubmenu }: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  hasSubmenu?: boolean;
}) => (
  <button 
    type="button"
    onMouseEnter={onMouseEnter}
    onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors text-left group"
  >
    <div className="flex items-center gap-3">
      <div className="text-gray-400 group-hover:text-gray-600">
        {icon}
      </div>
      <span className="text-[12px] font-bold text-gray-600 leading-none">{label}</span>
    </div>
    {hasSubmenu && <ChevronRight className="h-3 w-3 text-gray-300" />}
  </button>
);

const ColorItem = ({ label, color, bg, isSelected }: { 
  label: string; 
  color?: string; 
  bg?: string; 
  isSelected?: boolean;
}) => (
  <button 
    type="button"
    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 transition-colors text-left group"
  >
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded flex items-center justify-center border border-gray-100 bg-white text-[11px] font-bold ${color || 'text-gray-900'} ${bg || ''}`}>
        A
      </div>
      <span className="text-[12px] font-bold text-gray-700">{label}</span>
    </div>
    {isSelected && <div className="w-1 h-1 rounded-full bg-blue-600" />}
  </button>
);

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Times", "Courier New", "Courier", "Verdana", "Georgia", "Palatino", "Garamond", "Bookman", "Comic Sans MS", "Trebuchet MS", "Arial Black", "Impact", "Tahoma", "Geneva", "Century Gothic", "Lucida Grande", "Optima", "Avant Garde", "Arial Narrow", "sans-serif", "serif", "monospace", "fantasy", "cursive", "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro", "Slabo 27px", "Raleway", "PT Sans", "Merriweather", "Noto Sans", "Nunito", "Concert One", "Promt", "Work Sans", "Fira Sans", "Rubik", "Mukta", "Playfair Display", "Poppins", "Inconsolata", "Titillium Web", "Quicksand", "Anton", "Josefin Sans", "Libre Baskerville", "Karla", "Arimo", "Oxygen", "Dosis", "Cabin", "Hind", "Fjalla One", "Abel", "Yanone Kaffeesatz", "Righteous", "Lobster", "Teko", "Pacifico", "Shadows Into Light", "Dancing Script", "Bree Serif", "Exo", "Asap", "Crete Round", "Varela Round", "Pathway Gothic One", "Rokkitt", "Play", "Zilla Slab", "Cinzel", "Crimson Text", "Patua One", "Amatic SC", "Signika", "Monda", "Gloria Hallelujah", "Acme", "Ubuntu", "Questrial", "Permanent Marker", "Changa", "Vollkorn", "Alegreya", "Courgette", "Russo One", "Kaushan Script", "Cuprum", "Volkhov", "Handlee", "Glegoo", "Gochi Hand", "Trocchi", "Istok Web", "Kreon", "Marmelad", "Merienda", "Allan", "Aclonica", "Knewave", "Leckerli One", "Michroma", "Niconne", "Oleo Script", "Overlock", "Pangolin", "Philosopher", "Rancho", "Satisfy", "Tenor Sans", "Viga", "Yellowtail", "Architects Daughter", "Bad Script", "Bangers", "Bebas Neue", "Caveat", "Chewy", "Cookie", "Cormorant", "Covered By Your Grace"];

const ContentEditableBlock = ({ block, updateBlock, handleSelect, className, placeholder, tagName: Tag = 'div' }: any) => {
    const elRef = React.useRef<any>(null);
    React.useEffect(() => {
        if (elRef.current && elRef.current.innerHTML !== (block.content || '')) {
            elRef.current.innerHTML = block.content || '';
        }
    }, [block.content]);

    return (
        <Tag
            ref={elRef}
            id={`block-${block.id}`}
            contentEditable
            suppressContentEditableWarning
            className={`${className} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none cursor-text min-h-[1.5em] focus:outline-none focus:ring-0 break-words`}
            onInput={(e: any) => updateBlock(block.id, e.currentTarget.innerHTML)}
            onMouseUp={(e: any) => handleSelect(e, block.id)}
            onKeyUp={(e: any) => handleSelect(e, block.id)}
            data-placeholder={placeholder}
        />
    );
};

interface PageProps {
    type: 'privacy' | 'terms' | 'return' | 'refund' | 'about';
    title: string;
    icon: React.ReactNode;
}

export default function LegalPageEditor({ type, title }: PageProps) {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.storeId as string;
    const { showToast } = useToast();
    
    const [content, setContent] = useState('');
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // States for block-editor
    type BlockType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'quote' | 'bullet' | 'number' | 'check' | 'code' | 'divider' | 'table' | 'image' | 'toggle' | 'callout';
    interface Block {
      id: string;
      type: BlockType;
      content: any;
      isExpanded?: boolean;
    }
    const [blocks, setBlocks] = useState<Block[]>([
      { id: 'legal-initial', type: 'paragraph', content: '' }
    ]);
    const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

    // States for tools
    const [activeTool, setActiveTool] = useState<{ blockId: string, type: 'plus' | 'grip' | 'color' | 'emoji' } | null>(null);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 3 });
    const [imageConfig, setImageConfig] = useState({ url: '', caption: '', width: '100%' });
    const [emojiSearch, setEmojiSearch] = useState('');

    // States for text selection toolbar
    const [selectionConfig, setSelectionConfig] = useState<{
        blockId: string;
        top: number;
        left: number;
    } | null>(null);
    const [showFontMenu, setShowFontMenu] = useState(false);

    // Close menus on click outside
    useEffect(() => {
        const handleClick = () => {
          setActiveTool(null);
          setShowColorMenu(false);
          setShowFontMenu(false);
          if (window.getSelection()?.toString().trim() === '') {
            setSelectionConfig(null);
          }
        };
        window.addEventListener('click', handleClick);
        window.addEventListener('scroll', () => setSelectionConfig(null), true);
        return () => {
          window.removeEventListener('click', handleClick);
          window.removeEventListener('scroll', () => setSelectionConfig(null), true);
        };
    }, []);

    const handleSelect = (e: any, blockId: string) => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.width > 0) {
                setSelectionConfig({
                    blockId,
                    top: rect.top - 50,
                    left: rect.left + (rect.width / 2) - 150
                });
                return;
            }
        }
        setSelectionConfig(null);
    };

    const applyFormatting = (format: string, value?: string) => {
        if (!selectionConfig) return;
        
        switch(format) {
            case 'bold': document.execCommand('bold', false); break;
            case 'italic': document.execCommand('italic', false); break;
            case 'underline': document.execCommand('underline', false); break;
            case 'strikethrough': document.execCommand('strikeThrough', false); break;
            case 'alignLeft': document.execCommand('justifyLeft', false); break;
            case 'alignCenter': document.execCommand('justifyCenter', false); break;
            case 'alignRight': document.execCommand('justifyRight', false); break;
            case 'fontName': document.execCommand('fontName', false, value); break;
            case 'link': 
                const url = prompt('Enter link URL:');
                if (url) document.execCommand('createLink', false, url);
                break;
            case 'highlight': document.execCommand('hiliteColor', false, 'yellow'); break;
        }
        
        const block = blocks.find(b => b.id === selectionConfig.blockId);
        if (block) {
            const blockEl = document.getElementById(`block-${block.id}`);
            if (blockEl) {
                if (typeof block.content === 'string') {
                    updateBlock(block.id, blockEl.innerHTML);
                } else if (block.content.text !== undefined) {
                    updateBlock(block.id, { ...block.content, text: blockEl.innerHTML });
                }
            }
        }
        setShowFontMenu(false);
    };

    // Sync blocks to content string
    useEffect(() => {
        let serialized = '';
        blocks.forEach(b => {
          if (b.type === 'h1') serialized += `# ${b.content}\n\n`;
          else if (b.type === 'h2') serialized += `## ${b.content}\n\n`;
          else if (b.type === 'h3') serialized += `### ${b.content}\n\n`;
          else if (b.type === 'paragraph') serialized += `${b.content}\n\n`;
          else if (b.type === 'quote') serialized += `> ${b.content}\n\n`;
          else if (b.type === 'bullet') serialized += `- ${b.content}\n`;
          else if (b.type === 'number') serialized += `1. ${b.content}\n`;
          else if (b.type === 'check') serialized += `- [ ] ${b.content}\n`;
          else if (b.type === 'code') serialized += `\`\`\`\n${b.content}\n\`\`\`\n\n`;
          else if (b.type === 'divider') serialized += `---\n\n`;
          else if (b.type === 'toggle') serialized += `<details><summary>${b.content.summary}</summary>${b.content.details}</details>\n\n`;
          else if (b.type === 'callout') serialized += `> ${b.content.emoji} ${b.content.text}\n\n`;
          else if (b.type === 'image') serialized += `![${b.content.caption}](${b.content.url})\n\n`;
          else if (b.type === 'table') {
            let t = '\n';
            if (b.content.rows?.length > 0) {
              t += '| ' + b.content.rows[0].join(' | ') + ' |\n';
              t += '| ' + b.content.rows[0].map(() => '---').join(' | ') + ' |\n';
              b.content.rows.slice(1).forEach((row: any) => {
                t += '| ' + row.join(' | ') + ' |\n';
              });
            }
            serialized += t + '\n';
          }
        });
        setContent(serialized.trim());
    }, [blocks]);

    const addBlock = (type: BlockType, afterId?: string) => {
        const newBlock: Block = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          content: type === 'table' ? { rows: [['','',''], ['','',''], ['','','']] } : 
                   type === 'image' ? { url: '', caption: '', width: '100%' } :
                   type === 'toggle' ? { summary: 'New Toggle', details: 'Content...' } : 
                   type === 'callout' ? { emoji: '💡', text: '' } : ''
        };
        if (afterId) {
          const index = blocks.findIndex(b => b.id === afterId);
          const newBlocks = [...blocks];
          newBlocks.splice(index + 1, 0, newBlock);
          setBlocks(newBlocks);
        } else {
          setBlocks([...blocks, newBlock]);
        }
        setActiveTool(null);
    };

    const updateBlock = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

    const deleteBlock = (id: string) => {
        if (blocks.length > 1) {
          setBlocks(blocks.filter(b => b.id !== id));
        } else {
          setBlocks([{ id: 'legal-reset', type: 'paragraph', content: '' }]);
        }
    };

    const emojis = [
        "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😮‍💨","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😶‍🌫️","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","😵‍💫","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡","💩","👻","💀","☠️","👽","👾","🤖","🎃","😺","😸","😹","😻","😼","😽","🙀","😿","😾"
    ];

    useEffect(() => {
        if (!storeId) return;

        const unsubscribe = onSnapshot(doc(db, 'stores', storeId), (snap) => {
            if (snap.exists()) {
                const data = snap.data() as Store;
                setStore(data);
                setContent(data.policies?.[type] || '');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [storeId, type]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const storeRef = doc(db, 'stores', storeId);
            await updateDoc(storeRef, {
                [`policies.${type}`]: content,
                updatedAt: new Date()
            });
            showToast('Changes saved successfully', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    const displayTitle = type === 'terms' ? 'Terms & Conditions' : 
                   type === 'privacy' ? 'Privacy Policy' : 
                   type === 'return' ? 'Return Policy' : 
                   type === 'refund' ? 'Refund Policy' : 'About';

    const desc = type === 'about' ? "Edit your shop's about section" : `Edit your shop's ${type.toLowerCase()} policy`;

    return (
        <div className="min-h-screen bg-white md:bg-[#fafafa] p-6 md:p-12 font-sans pb-32">
            <div className="max-w-[1000px] mx-auto">
                
                {/* Header section */}
                <div className="mb-8">
                    <h1 className="text-[28px] font-bold text-gray-900 leading-tight">{displayTitle}</h1>
                    <p className="text-[14px] text-gray-500 mt-1">{desc}</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 min-h-[600px]">
                    <div className="px-6 py-8 md:px-12">
                        <div className="mb-10">
                            <h2 className="text-[15px] font-bold text-gray-900">{displayTitle} Content</h2>
                            <p className="text-[12px] text-gray-500 mt-1 font-medium">Use the editor below to create and edit your {type === 'about' ? 'about section' : type.toLowerCase() + ' policy'}</p>
                        </div>

                        {/* Floating Rich Text Toolbar */}
                        <AnimatePresence>
                            {selectionConfig && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{ top: selectionConfig.top, left: selectionConfig.left }}
                                    className="fixed z-[200] bg-white rounded-lg shadow-xl border border-gray-200 p-1 flex items-center gap-1"
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-1 px-2 border-r border-gray-100 relative">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowFontMenu(!showFontMenu)}
                                            className="flex items-center gap-1 text-[13px] font-bold text-gray-600 hover:bg-gray-100 px-2 py-1.5 rounded"
                                        >
                                            <Type className="h-3.5 w-3.5" /> Text <ChevronDown className="h-3 w-3" />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {showFontMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[210] max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col w-[200px]"
                                                >
                                                    {FONTS.map(font => (
                                                        <button
                                                            key={font}
                                                            type="button"
                                                            className="text-left px-4 py-2 hover:bg-gray-50 text-[14px] text-gray-700"
                                                            style={{ fontFamily: font }}
                                                            onClick={() => applyFormatting('fontName', font)}
                                                        >
                                                            {font}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex bg-gray-50 rounded p-0.5 ml-1">
                                        <button type="button" onClick={() => applyFormatting('bold')} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"><Bold className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => applyFormatting('italic')} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"><Italic className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => applyFormatting('underline')} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"><Underline className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => applyFormatting('strikethrough')} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"><Strikethrough className="h-4 w-4" /></button>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 border-x border-gray-100 mx-1">
                                        <button type="button" className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900"><AlignLeft className="h-4 w-4" /></button>
                                        <button type="button" className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900"><AlignCenter className="h-4 w-4" /></button>
                                        <button type="button" className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900"><AlignRight className="h-4 w-4" /></button>
                                    </div>
                                    <div className="flex items-center gap-1 pr-1">
                                        <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded text-blue-500"><Highlighter className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => applyFormatting('link')} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded text-gray-600"><Link2 className="h-4 w-4" /></button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Block Editor Area */}
                        <div className="space-y-1 relative min-h-[500px]">
                            {blocks.map((block) => (
                                <div 
                                    key={block.id} 
                                    className="group relative flex items-start gap-2 -ml-12 pl-12"
                                    onMouseEnter={() => setHoveredBlock(block.id)}
                                    onMouseLeave={() => setHoveredBlock(null)}
                                >
                                    {/* Handles */}
                                    <div className={`absolute left-0 top-1 flex items-center gap-0.5 transition-opacity duration-200 ${hoveredBlock === block.id ? 'opacity-100' : 'opacity-0'}`}>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setActiveTool({ blockId: block.id, type: 'plus' }); }} className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded text-gray-400">
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setActiveTool({ blockId: block.id, type: 'grip' }); }} className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded text-gray-400">
                                            <GripVertical className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Block Content */}
                                    <div className="flex-1">
                                        {block.type === 'h1' && (
                                            <ContentEditableBlock 
                                                block={block} updateBlock={updateBlock} handleSelect={handleSelect}
                                                className="w-full text-3xl font-bold text-gray-900 bg-transparent outline-none"
                                                placeholder="Heading 1"
                                                tagName="h1"
                                            />
                                        )}
                                        {block.type === 'h2' && (
                                            <ContentEditableBlock 
                                                block={block} updateBlock={updateBlock} handleSelect={handleSelect}
                                                className="w-full text-2xl font-bold text-gray-800 bg-transparent outline-none"
                                                placeholder="Heading 2"
                                                tagName="h2"
                                            />
                                        )}
                                        {block.type === 'h3' && (
                                            <ContentEditableBlock 
                                                block={block} updateBlock={updateBlock} handleSelect={handleSelect}
                                                className="w-full text-xl font-bold text-gray-700 bg-transparent outline-none"
                                                placeholder="Heading 3"
                                                tagName="h3"
                                            />
                                        )}
                                        {block.type === 'paragraph' && (
                                            <ContentEditableBlock 
                                                block={block} updateBlock={updateBlock} handleSelect={handleSelect}
                                                className="w-full text-[15px] text-gray-800 bg-transparent outline-none leading-relaxed"
                                                placeholder="Type '/' for commands..."
                                            />
                                        )}
                                        {block.type === 'quote' && (
                                            <div className="border-l-4 border-gray-200 pl-4 py-1">
                                                <ContentEditableBlock 
                                                    block={{...block, content: typeof block.content === 'string' ? block.content : block.content?.text || ''}} 
                                                    updateBlock={(id: string, val: string) => updateBlock(id, val)} 
                                                    handleSelect={handleSelect}
                                                    className="w-full text-[15px] text-gray-600 bg-transparent outline-none italic leading-relaxed"
                                                    placeholder="Empty quote"
                                                />
                                            </div>
                                        )}
                                        {block.type === 'bullet' && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-gray-400 mt-1">•</span>
                                                <ContentEditableBlock 
                                                    block={block} updateBlock={updateBlock} handleSelect={handleSelect}
                                                    className="w-full text-[15px] text-gray-800 bg-transparent outline-none leading-relaxed"
                                                    placeholder="List item"
                                                />
                                            </div>
                                        )}
                                        {block.type === 'check' && (
                                            <div className="flex items-start gap-2">
                                                <CheckSquare className="h-4 w-4 text-gray-300 mt-1" />
                                                <textarea
                                                    className="w-full text-[15px] text-gray-800 bg-transparent outline-none resize-none leading-relaxed"
                                                    value={block.content}
                                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                                    placeholder="To-do list"
                                                    rows={1}
                                                />
                                            </div>
                                        )}
                                        {block.type === 'toggle' && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setBlocks(blocks.map(b => b.id === block.id ? { ...b, isExpanded: !b.isExpanded } : b))}>
                                                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${block.isExpanded ? 'rotate-90' : ''}`} />
                                                    </button>
                                                    <input 
                                                        className="flex-1 text-[15px] font-bold text-gray-800 bg-transparent outline-none"
                                                        value={block.content.summary}
                                                        onChange={(e) => updateBlock(block.id, { ...block.content, summary: e.target.value })}
                                                        placeholder="Toggle summary"
                                                    />
                                                </div>
                                                {block.isExpanded && (
                                                    <div className="pl-6">
                                                        <textarea
                                                            className="w-full text-[14px] text-gray-600 bg-transparent outline-none resize-none"
                                                            value={block.content.details}
                                                            onChange={(e) => updateBlock(block.id, { ...block.content, details: e.target.value })}
                                                            placeholder="Toggle content..."
                                                            rows={2}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {block.type === 'divider' && (
                                            <hr className="my-4 border-gray-100" />
                                        )}
                                        {block.type === 'callout' && (
                                            <div className="flex px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg gap-3">
                                                <div className="relative group/emoji">
                                                    <button 
                                                        type="button"
                                                        className="text-xl px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); setActiveTool({ blockId: block.id, type: 'emoji' }); }}
                                                    >
                                                        {block.content.emoji}
                                                    </button>
                                                </div>
                                                <ContentEditableBlock
                                                    block={{id: block.id, content: block.content.text}} 
                                                    updateBlock={(id: string, text: string) => updateBlock(block.id, { ...block.content, text })} 
                                                    handleSelect={handleSelect}
                                                    className="w-full text-[15px] text-gray-800 bg-transparent outline-none leading-relaxed"
                                                    placeholder="Type callout text..."
                                                />
                                            </div>
                                        )}
                                        {block.type === 'code' && (
                                            <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-gray-300">
                                                <div className="flex justify-between items-center mb-2 px-1">
                                                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Powershell</span>
                                                </div>
                                                <textarea
                                                    className="w-full bg-transparent outline-none resize-none text-blue-300"
                                                    value={block.content}
                                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                                    placeholder="// Type code here..."
                                                    rows={4}
                                                />
                                            </div>
                                        )}
                                        {block.type === 'image' && (
                                            <div className="relative group/img bg-gray-50 border border-gray-100 rounded-lg overflow-hidden min-h-[100px] flex flex-col items-center justify-center p-8">
                                                {block.content.url ? (
                                                    <div className="space-y-2 w-full flex flex-col items-center">
                                                        <img src={block.content.url} alt={block.content.caption} className="rounded max-w-full h-auto shadow-sm" style={{ width: block.content.width }} />
                                                        <input 
                                                            className="text-[12px] text-center text-gray-400 bg-transparent outline-none w-full"
                                                            value={block.content.caption}
                                                            onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
                                                            placeholder="Add a caption..."
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setActiveTool({ blockId: block.id, type: 'plus' })}>
                                                        <ImageIcon className="h-6 w-6 text-gray-300" />
                                                        <span className="text-[12px] font-bold text-gray-400">Add Image</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {block.type === 'table' && (
                                            <div className="overflow-x-auto my-4 group/table border rounded-lg border-gray-100 bg-white">
                                                <table className="w-full border-collapse">
                                                    <tbody>
                                                        {block.content.rows.map((row: any[], rIndex: number) => (
                                                            <tr key={rIndex}>
                                                                {row.map((cell, cIndex) => (
                                                                    <td key={cIndex} className="border border-gray-100 p-2 min-w-[100px]">
                                                                        <textarea
                                                                            className="w-full text-sm outline-none resize-none bg-transparent"
                                                                            value={cell}
                                                                            onChange={(e) => {
                                                                                const newRows = [...block.content.rows];
                                                                                newRows[rIndex][cIndex] = e.target.value;
                                                                                updateBlock(block.id, { ...block.content, rows: newRows });
                                                                            }}
                                                                            rows={1}
                                                                        />
                                                                    </td>
                                                                ))}
                                                                <td className="w-10 opacity-0 group-hover/table:opacity-100 border-none px-1">
                                                                    <button onClick={() => {
                                                                        const newRows = block.content.rows.filter((_: any, i: number) => i !== rIndex);
                                                                        updateBlock(block.id, { ...block.content, rows: newRows });
                                                                    }} className="text-red-400 hover:text-red-600"><Trash className="h-3.5 w-3.5" /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="flex p-2 gap-4 bg-gray-50 border-t border-gray-100">
                                                    <button onClick={() => {
                                                        const newRows = [...block.content.rows, new Array(block.content.rows[0].length).fill('')];
                                                        updateBlock(block.id, { ...block.content, rows: newRows });
                                                    }} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-blue-600 mb-1"><Rows className="h-3 w-3" /> Add Row</button>
                                                    <button onClick={() => {
                                                        const newRows = block.content.rows.map((row: any[]) => [...row, '']);
                                                        updateBlock(block.id, { ...block.content, rows: newRows });
                                                    }} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-blue-600 mb-1"><Columns className="h-3 w-3" /> Add Column</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Context Menus */}
                                    <AnimatePresence>
                                        {activeTool?.blockId === block.id && activeTool.type === 'plus' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                className="absolute left-0 top-8 z-[150] w-[300px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                                            >
                                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar py-2">
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Headings</div>
                                                    <MenuItem icon={<Heading1 className="h-4 w-4" />} label="Heading 1" desc="Main title" onClick={() => addBlock('h1', block.id)} />
                                                    <MenuItem icon={<Heading2 className="h-4 w-4" />} label="Heading 2" desc="Section title" onClick={() => addBlock('h2', block.id)} />
                                                    <MenuItem icon={<Plus className="h-4 w-4" />} label="Toggle List" desc="Collapsible content" onClick={() => addBlock('toggle', block.id)} />
                                                    
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Basic</div>
                                                    <MenuItem icon={<Type className="h-4 w-4" />} label="Text" desc="Plain writing" onClick={() => addBlock('paragraph', block.id)} />
                                                    <MenuItem icon={<CheckSquare className="h-4 w-4" />} label="Check List" desc="Tasks with clicks" onClick={() => addBlock('check', block.id)} />
                                                    <MenuItem icon={<List className="h-4 w-4" />} label="Bullet List" desc="Square bullets" onClick={() => addBlock('bullet', block.id)} />
                                                    <MenuItem icon={<Quote className="h-4 w-4" />} label="Quote" desc="Capture a quote" onClick={() => addBlock('quote', block.id)} />
                                                    <MenuItem icon={<Smile className="h-4 w-4" />} label="Callout" desc="Highlighted text" onClick={() => addBlock('callout', block.id)} />
                                                    <MenuItem icon={<Minus className="h-4 w-4" />} label="Divider" desc="Visual break" onClick={() => addBlock('divider', block.id)} />
                                                    
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Media & Advanced</div>
                                                    <MenuItem icon={<ImageIcon className="h-4 w-4" />} label="Image" desc="Visual media" onClick={() => addBlock('image', block.id)} />
                                                    <MenuItem icon={<TableIcon className="h-4 w-4" />} label="Table" desc="Data grid" onClick={() => addBlock('table', block.id)} />
                                                    <MenuItem icon={<Code className="h-4 w-4" />} label="Code Block" desc="Programming" onClick={() => addBlock('code', block.id)} />
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTool?.blockId === block.id && activeTool.type === 'emoji' && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute left-6 top-10 z-[160] w-[260px] bg-white rounded-lg shadow-xl border border-gray-100 p-2"
                                            >
                                                <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                                    {["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😮‍💨","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😶‍🌫️","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","😵‍💫","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡","💩","👻","💀","☠️","👽","👾","🤖","🎃","😺","😸","😹","😻","😼","😽","🙀","😿","😾", "💡", "⭐", "⚠️", "🔥", "🚀", "📢", "📌", "✅", "❌", "ℹ️", "💬"].map((emoji, i) => (
                                                        <button 
                                                            key={i}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateBlock(block.id, { ...block.content, emoji });
                                                                setActiveTool(null);
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTool?.blockId === block.id && activeTool.type === 'grip' && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute left-6 top-6 z-[150] w-[140px] bg-white rounded-lg shadow-xl border border-gray-100 py-1"
                                            >
                                                <div className="relative">
                                                    <ContextMenuItem 
                                                        icon={<Palette className="h-3.5 w-3.5 text-gray-400" />} 
                                                        label="Colors" 
                                                        hasSubmenu 
                                                        onMouseEnter={() => setShowColorMenu(true)}
                                                        onClick={(e) => { e.stopPropagation(); setShowColorMenu(!showColorMenu); }}
                                                    />
                                                    
                                                    {/* Color Submenu */}
                                                    <AnimatePresence>
                                                        {showColorMenu && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, x: 10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 10 }}
                                                                className="absolute left-full top-0 ml-1 w-[180px] bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[120]"
                                                                onMouseLeave={() => setShowColorMenu(false)}
                                                            >
                                                                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Text</div>
                                                                <ColorItem label="Default" color="text-gray-900" isSelected />
                                                                <ColorItem label="Gray" color="text-gray-500" />
                                                                <ColorItem label="Red" color="text-red-500" />
                                                                <ColorItem label="Blue" color="text-blue-500" />
                                                                
                                                                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Background</div>
                                                                <ColorItem label="Default" isSelected />
                                                                <ColorItem label="Gray" bg="bg-gray-100" />
                                                                <ColorItem label="Yellow" bg="bg-yellow-100" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <ContextMenuItem icon={<Columns className="h-3.5 w-3.5 text-gray-400" />} label="Duplicate" onClick={() => addBlock(block.type, block.id)} />
                                                <ContextMenuItem icon={<Trash className="h-3.5 w-3.5 text-red-500" />} label="Delete" onClick={() => deleteBlock(block.id)} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer button */}
                <div className="flex">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-[13px] shadow-sm disabled:opacity-50 active:scale-95"
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Save Changes
                    </button>
                </div>

            </div>

            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e5e7eb;
                border-radius: 10px;
              }
            `}</style>
        </div>
    );
}
