import React, { useEffect, useState } from 'react';
import { ClinicalFormSchema, ClinicalField, ClinicalGroup } from '../domain/types';
import { schemaStore } from '../persistence/SchemaStore';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';

interface FormDesignerProps {
  schemaId: string;
  onBack: () => void;
}

/**
 * Componente para campos en la paleta (izquierda)
 */
function DraggablePaletteField({ field }: { field: ClinicalField }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${field.id}`,
    data: { field, source: 'palette' }
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`border border-[var(--border-clinical)] rounded-xl p-3 bg-[var(--surface-clinical)] text-[var(--text-primary)] text-[11px] font-bold uppercase tracking-wider cursor-grab hover:border-[var(--accent-clinical)] transition-all shadow-sm mb-2 ${isDragging ? 'opacity-30' : 'hover:shadow-md'}`}
      title={field.label}
    >
      <span className="text-[var(--accent-clinical)] mr-2 opacity-50">⋮⋮</span> {field.label}
      {field.multivalue && <span className="ml-2 bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded text-[8px] border border-purple-500/20">MV</span>}
    </div>
  );
}

/**
 * Componente para campos en el lienzo (centro)
 */
function DraggableCanvasField({ field, isSelected, onClick }: { field: ClinicalField, isSelected: boolean, onClick: (e: React.MouseEvent) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `canvas-${field.id}`,
    data: { field, source: 'canvas' }
  });

  return (
    <span 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm transition-all border cursor-pointer select-none ${isDragging ? 'opacity-0' : ''} ${isSelected ? 'bg-[var(--accent-clinical)] text-white border-[var(--accent-clinical)] shadow-blue-500/20' : 'bg-[var(--bg-clinical)] text-[var(--text-primary)] border-[var(--border-clinical)] hover:border-[var(--accent-clinical)]/50'}`}
    >
      <span className="opacity-30">⋮⋮</span>
      {field.label}
      {field.multivalue && <span className={`px-1 rounded text-[8px] ml-1 ${isSelected ? 'bg-white/20 text-white' : 'bg-purple-500/10 text-purple-500'}`}>MV</span>}
    </span>
  );
}

/**
 * Área de destino para grupos
 */
function DroppableGroup({ group, children }: { group: ClinicalGroup, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `group-${group.id}`,
    data: { groupId: group.id, type: 'group' }
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`bg-[var(--surface-clinical)] border-2 rounded-2xl p-6 mb-4 transition-all ${isOver ? 'border-[var(--accent-clinical)] bg-[var(--accent-clinical)]/5 scale-[1.01]' : 'border-[var(--border-clinical)]'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[10px] font-black text-[var(--accent-clinical)] uppercase tracking-[0.2em]">
          {group.title}
        </h4>
        <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest bg-[var(--bg-clinical)] px-2 py-0.5 rounded border border-[var(--border-clinical)]">{group.layout}</span>
      </div>
      <div className="flex flex-wrap gap-3 min-h-[50px] items-start">
        {children}
        {isOver && <div className="border-2 border-dashed border-[var(--accent-clinical)]/40 bg-[var(--accent-clinical)]/10 rounded-lg w-32 h-10 animate-pulse"></div>}
      </div>
    </div>
  );
}

/**
 * Área de destino para la paleta (para eliminar campos del lienzo)
 */
function DroppablePalette({ children, isOver }: { children: React.ReactNode, isOver: boolean }) {
  const { setNodeRef } = useDroppable({
    id: 'palette-area',
    data: { type: 'palette' }
  });

  return (
    <aside 
      ref={setNodeRef}
      className={`w-80 border-r border-[var(--border-clinical)] shadow-sm flex flex-col z-0 transition-all duration-300 ${isOver ? 'bg-red-500/5 border-red-500/30' : 'bg-[var(--surface-clinical)]'}`}
    >
      {children}
    </aside>
  );
}


export function FormDesigner({ schemaId, onBack }: FormDesignerProps) {
  const [schema, setSchema] = useState<ClinicalFormSchema | null>(null);
  const [activeField, setActiveField] = useState<ClinicalField | null>(null);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [selectedElement, setSelectedElement] = useState<{ type: 'field' | 'group' | 'section', id: string, data: any } | null>(null);
  const [isOverPalette, setIsOverPalette] = useState(false);

  useEffect(() => {
    loadSchema();
  }, [schemaId]);

  const loadSchema = async () => {
    const loaded = await schemaStore.getSchema(schemaId);
    setSchema(loaded);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveField(active.data.current?.field || null);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setIsOverPalette(over?.id === 'palette-area');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveField(null);
    setIsOverPalette(false);
    const { active, over } = event;
    if (!over || !schema) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const newSchema = JSON.parse(JSON.stringify(schema)) as ClinicalFormSchema;
    const fieldToMove = activeData.field as ClinicalField;

    // CASO 1: De Paleta a Grupo (Asignar)
    if (activeData.source === 'palette' && overData.type === 'group') {
      const groupId = overData.groupId;
      newSchema.unassignedFields = newSchema.unassignedFields?.filter(f => f.id !== fieldToMove.id) || [];
      for (const section of newSchema.sections) {
        const group = section.groups.find(g => g.id === groupId);
        if (group) {
          group.fields.push(fieldToMove);
          break;
        }
      }
    }

    // CASO 2: De Lienzo a Paleta (Eliminar/Desasignar)
    else if (activeData.source === 'canvas' && overData.type === 'palette') {
      newSchema.sections.forEach(section => {
        section.groups.forEach(group => {
          group.fields = group.fields.filter(f => f.id !== fieldToMove.id);
        });
      });
      if (!newSchema.unassignedFields) newSchema.unassignedFields = [];
      newSchema.unassignedFields.push(fieldToMove);
      if (selectedElement?.id === fieldToMove.id) setSelectedElement(null);
    }

    // CASO 3: De Grupo A a Grupo B (Mover entre grupos)
    else if (activeData.source === 'canvas' && overData.type === 'group') {
      const targetGroupId = overData.groupId;
      newSchema.sections.forEach(section => {
        section.groups.forEach(group => {
          group.fields = group.fields.filter(f => f.id !== fieldToMove.id);
        });
      });
      for (const section of newSchema.sections) {
        const group = section.groups.find(g => g.id === targetGroupId);
        if (group) {
          group.fields.push(fieldToMove);
          break;
        }
      }
    }

    setSchema(newSchema);
    await schemaStore.saveSchema(newSchema);
  };

  const handleAddGroup = async (sectionId: string) => {
    if (!schema) return;
    const newSchema = { ...schema };
    const section = newSchema.sections.find(s => s.id === sectionId);
    if (section) {
      section.groups.push({
        id: `grp-${Date.now()}`,
        title: 'Nuevo Grupo',
        layout: 'stack',
        fields: []
      });
      setSchema(newSchema);
      await schemaStore.saveSchema(newSchema);
    }
  };

  const handleResetSchema = async () => {
    if (!schema || !window.confirm("¿Estás seguro de querer devolver todos los campos a la paleta? Esta acción vaciará todos los grupos y secciones.")) return;
    const newSchema = JSON.parse(JSON.stringify(schema)) as ClinicalFormSchema;
    const allFields: ClinicalField[] = [...(newSchema.unassignedFields || [])];
    newSchema.sections.forEach(section => {
      section.groups.forEach(group => {
        allFields.push(...group.fields);
      });
      section.groups = [];
    });
    newSchema.unassignedFields = allFields;
    setSchema(newSchema);
    setSelectedElement(null);
    await schemaStore.saveSchema(newSchema);
  };

  const handlePublishSchema = async () => {
    if (!schema || !window.confirm("¿Deseas publicar este esquema oficialmente? Reemplazará cualquier versión anterior para este tipo de formulario.")) return;
    const allSchemas = await schemaStore.getAllSchemas();
    for (const s of allSchemas) {
      if (s.name === schema.name && s.status === 'published' && s.id !== schema.id) {
        s.status = 'draft';
        await schemaStore.saveSchema(s);
      }
    }
    const newSchema = { ...schema, status: 'published' as const, updatedAt: Date.now() };
    setSchema(newSchema);
    await schemaStore.saveSchema(newSchema);
    alert("¡Esquema publicado con éxito!");
  };

  const updateElementProperty = async (property: string, value: any) => {
    if (!schema || !selectedElement) return;
    const newSchema = JSON.parse(JSON.stringify(schema)) as ClinicalFormSchema;
    if (selectedElement.type === 'field') {
      newSchema.sections.forEach(s => s.groups.forEach(g => {
        const field = g.fields.find(f => f.id === selectedElement.id);
        if (field) (field as any)[property] = value;
      }));
    } else if (selectedElement.type === 'group') {
      newSchema.sections.forEach(s => {
        const group = s.groups.find(g => g.id === selectedElement.id);
        if (group) (group as any)[property] = value;
      });
    } else if (selectedElement.type === 'section') {
      const section = newSchema.sections.find(s => s.id === selectedElement.id);
      if (section) (section as any)[property] = value;
    }
    setSchema(newSchema);
    await schemaStore.saveSchema(newSchema);
    if (selectedElement.type === 'field' || selectedElement.type === 'group' || selectedElement.type === 'section') {
      setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, [property]: value } });
    }
  };

  if (!schema) return <div className="p-8 text-center text-[var(--text-secondary)] font-bold animate-pulse uppercase tracking-widest text-xs">Cargando Engine...</div>;

  return (
    <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-[var(--bg-clinical)] font-sans">
        {/* Header del Designer */}
        <header className="bg-[var(--surface-clinical)] border-b border-[var(--border-clinical)] p-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-[var(--bg-clinical)] rounded-xl transition-all text-[var(--text-secondary)] active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase leading-none mb-1">{schema.name}</h1>
              <div className="flex items-center gap-3">
                 <span className="text-[9px] text-[var(--accent-clinical)] font-bold font-mono tracking-widest opacity-60">ID: {schema.id.toUpperCase()}</span>
                 <div className="w-1 h-1 bg-[var(--border-clinical)] rounded-full"></div>
                 <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Version {schema.version}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[var(--bg-clinical)] px-3 py-1.5 rounded-full border border-[var(--border-clinical)]">
               <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">{schema.status}</span>
            </div>
            
            <div className="w-[1px] h-6 bg-[var(--border-clinical)] mx-2"></div>

            <button 
              onClick={handleResetSchema}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              Reset
            </button>
            <button 
              onClick={handlePublishSchema}
              className="bg-[var(--accent-clinical)] hover:bg-blue-700 text-white px-6 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Publicar
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Panel: Field Palette (Droppable) */}
          <DroppablePalette isOver={isOverPalette}>
            <div className={`p-6 border-b border-[var(--border-clinical)] flex flex-col gap-4 transition-all ${isOverPalette ? 'bg-red-500/10' : 'bg-[var(--bg-clinical)]/50'}`}>
              <h2 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center justify-between">
                <span>{isOverPalette ? '⚠️ SOLTAR PARA ELIMINAR' : 'Paleta de Campos'}</span>
              </h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar en el corpus..."
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  className="w-full bg-[var(--surface-clinical)] border border-[var(--border-clinical)] rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[var(--accent-clinical)] focus:border-transparent transition-all outline-none text-[var(--text-primary)] placeholder:opacity-30"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col hide-scrollbar">
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-40 mb-6">
                {isOverPalette ? 'Confirma el borrado soltando aquí.' : 'Campos Huérfanos'}
              </p>
              <div className="space-y-1">
                {schema.unassignedFields && schema.unassignedFields.length > 0 ? (
                  schema.unassignedFields
                    .filter(f => f.label.toLowerCase().includes(paletteSearch.toLowerCase()))
                    .map(field => (
                      <DraggablePaletteField key={field.id} field={field} />
                    ))
                ) : (
                  <div className="text-center p-8 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-[var(--border-clinical)] rounded-2xl opacity-30">
                    Paleta Vacía
                  </div>
                )}
              </div>
            </div>
          </DroppablePalette>

          {/* Center Canvas: Schema Editor */}
          <main className="flex-1 overflow-y-auto bg-[var(--bg-clinical)] p-10 hide-scrollbar">
            <div className="max-w-4xl mx-auto">
              <div className="bg-[var(--surface-clinical)] border border-[var(--border-clinical)] rounded-[2.5rem] shadow-sm p-12 min-h-[600px]">
                <div className="border-b border-[var(--border-clinical)] pb-8 mb-10">
                  <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2 uppercase">Lienzo Clínico</h2>
                  <p className="text-xs font-medium text-[var(--text-secondary)] opacity-60 uppercase tracking-[0.1em]">Configuración visual de la taxonomía del formulario.</p>
                </div>

                {schema.sections.map(section => (
                  <div 
                    key={section.id} 
                    onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'section', id: section.id, data: section }); }}
                    className={`mb-8 border-2 rounded-3xl p-8 transition-all duration-300 ${selectedElement?.id === section.id ? 'border-[var(--accent-clinical)] bg-[var(--accent-clinical)]/5 shadow-xl shadow-blue-500/5' : 'border-[var(--border-clinical)] hover:border-[var(--accent-clinical)]/30'}`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedElement?.id === section.id ? 'bg-[var(--accent-clinical)] text-white' : 'bg-[var(--bg-clinical)] text-[var(--text-secondary)]'}`}>
                            {section.order}
                         </div>
                         <h3 className="font-black text-[var(--text-primary)] tracking-wider uppercase text-sm">{section.title}</h3>
                      </div>
                      <button className="text-[10px] font-black text-[var(--accent-clinical)] uppercase tracking-widest px-3 py-1 bg-[var(--accent-clinical)]/10 rounded-full hover:bg-[var(--accent-clinical)] hover:text-white transition-all">Config</button>
                    </div>
                    
                    {section.groups.length > 0 ? section.groups.map(group => (
                      <div 
                        key={group.id} 
                        onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'group', id: group.id, data: group }); }}
                        className={`cursor-pointer group/item mb-4`}
                      >
                        <DroppableGroup group={group}>
                          {group.fields.map(f => (
                            <DraggableCanvasField 
                              key={f.id} 
                              field={f} 
                              isSelected={selectedElement?.id === f.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'field', id: f.id, data: f }); }}
                            />
                          ))}
                        </DroppableGroup>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-[var(--border-clinical)] rounded-2xl opacity-20 my-4">
                        Sin Grupos Activos
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleAddGroup(section.id)}
                      className="w-full py-4 border-2 border-dashed border-[var(--border-clinical)] text-[var(--text-secondary)] opacity-40 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-100 hover:border-[var(--accent-clinical)] hover:text-[var(--accent-clinical)] hover:bg-[var(--accent-clinical)]/5 transition-all mt-4"
                    >
                      + Añadir Grupo Dinámico
                    </button>
                  </div>
                ))}

              </div>
            </div>
          </main>

          {/* Right Panel: Properties */}
          <aside className="w-80 bg-[var(--surface-clinical)] border-l border-[var(--border-clinical)] shadow-sm flex flex-col z-0">
            <div className="p-6 border-b border-[var(--border-clinical)] bg-[var(--bg-clinical)]/50">
              <h2 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">Propiedades Avanzadas</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              {selectedElement ? (
                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[var(--accent-clinical)] rounded-full"></div>
                    <span className="text-[10px] font-black text-[var(--accent-clinical)] uppercase tracking-widest">Editando {selectedElement.type}</span>
                  </div>

                  {/* LABEL / TITLE */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-50">Etiqueta Visual</label>
                    <input 
                      type="text" 
                      value={selectedElement.data.label || selectedElement.data.title || ""} 
                      onChange={(e) => updateElementProperty(selectedElement.type === 'field' ? 'label' : 'title', e.target.value)}
                      className="w-full bg-[var(--bg-clinical)] border border-[var(--border-clinical)] rounded-xl p-3 text-xs font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-clinical)] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {selectedElement.type === 'field' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-50">Tipo de Renderizado</label>
                        <select 
                          value={selectedElement.data.type}
                          onChange={(e) => updateElementProperty('type', e.target.value)}
                          className="w-full bg-[var(--bg-clinical)] border border-[var(--border-clinical)] rounded-xl p-3 text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer"
                        >
                          <option value="text">Texto Corto</option>
                          <option value="textarea">Área de Texto (Narrativa)</option>
                          <option value="number">Numérico</option>
                          <option value="boolean">Booleano (Check)</option>
                          <option value="date">Fecha</option>
                          <option value="multivalue">Multivalor ($)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-4 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={selectedElement.data.visible !== false}
                            onChange={(e) => updateElementProperty('visible', e.target.checked)}
                            className="w-4 h-4 rounded border-[var(--border-clinical)] text-[var(--accent-clinical)] focus:ring-[var(--accent-clinical)] transition-all"
                          />
                          <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">Visible en HCE</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={selectedElement.data.searchable !== false}
                            onChange={(e) => updateElementProperty('searchable', e.target.checked)}
                            className="w-4 h-4 rounded border-[var(--border-clinical)] text-[var(--accent-clinical)] focus:ring-[var(--accent-clinical)] transition-all"
                          />
                          <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">Motor de Búsqueda</span>
                        </label>
                      </div>

                      <div className="mt-8 p-4 bg-[var(--bg-clinical)] rounded-2xl border border-[var(--border-clinical)]">
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 mb-2">Source Mapping</p>
                        <code className="text-[10px] text-[var(--accent-clinical)] font-mono break-all font-bold">{selectedElement.data.sourceField}</code>
                      </div>
                    </>
                  )}

                  {selectedElement.type === 'group' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-50">Distribución (Layout)</label>
                        <select 
                          value={selectedElement.data.layout}
                          onChange={(e) => updateElementProperty('layout', e.target.value)}
                          className="w-full bg-[var(--bg-clinical)] border border-[var(--border-clinical)] rounded-xl p-3 text-xs font-bold text-[var(--text-primary)] outline-none"
                        >
                          <option value="stack">Vertical (Stack)</option>
                          <option value="grid">Rejilla (Grid)</option>
                        </select>
                      </div>
                      {selectedElement.data.layout === 'grid' && (
                        <div className="space-y-2">
                          <label className="block text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-50">Columnas Grid</label>
                          <input 
                            type="number" 
                            min="1" max="6"
                            value={selectedElement.data.columns || 2} 
                            onChange={(e) => updateElementProperty('columns', parseInt(e.target.value))}
                            className="w-full bg-[var(--bg-clinical)] border border-[var(--border-clinical)] rounded-xl p-3 text-xs font-bold text-[var(--text-primary)] outline-none"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-secondary)] opacity-30 gap-6">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[150px]">Selecciona un elemento para configurar sus metadatos</p>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>

      <DragOverlay>
        {activeField ? (
          <div className="border-2 border-[var(--accent-clinical)] rounded-xl p-3 bg-[var(--surface-clinical)] text-[var(--accent-clinical)] text-[11px] font-black uppercase tracking-widest shadow-2xl opacity-90 break-words w-64 cursor-grabbing flex items-center gap-3">
            <span className="opacity-50">⋮⋮</span> {activeField.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
