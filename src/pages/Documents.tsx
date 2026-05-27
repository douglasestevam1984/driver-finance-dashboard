import { useState, useEffect, CSSProperties } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Document {
  id: string;
  nome: string;
  dataValidade: string;
  renovacaoMeses: number; // meses até à próxima renovação
  notas: string;
}

type AlertStatus = 'ok' | 'aviso' | 'urgente' | 'vencido';
type Styles = Record<string, CSSProperties>;

interface DocumentStatus {
  diasRestantes: number;
  status: AlertStatus;
  dataRenovacao: string;
}

// ── Documentos pré-definidos TVDE ─────────────────────────────────────────────
const documentosPredefinidos = [
  { nome: 'Certificado de Registo Criminal', renovacaoMeses: 3 },
  { nome: 'Licença TVDE', renovacaoMeses: 12 },
  { nome: 'Carta de Condução', renovacaoMeses: 60 },
  { nome: 'Seguro do Veículo', renovacaoMeses: 12 },
  { nome: 'Inspeção do Veículo (IPO)', renovacaoMeses: 12 },
  { nome: 'Certificado de Aptidão (CAP)', renovacaoMeses: 12 },
];

// ── Hook ──────────────────────────────────────────────────────────────────────
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ── Calcula status do documento ───────────────────────────────────────────────
function calcularStatus(doc: Document): DocumentStatus {
  const hoje = new Date();
  const validade = new Date(doc.dataValidade);
  const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  // Data recomendada para renovar (15 dias antes do vencimento)
  const dataRenovacao = new Date(validade);
  dataRenovacao.setDate(dataRenovacao.getDate() - 15);
  const dataRenovacaoStr = dataRenovacao.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  let status: AlertStatus = 'ok';
  if (diasRestantes < 0) status = 'vencido';
  else if (diasRestantes <= 7) status = 'urgente';
  else if (diasRestantes <= 30) status = 'aviso';

  return { diasRestantes, status, dataRenovacao: dataRenovacaoStr };
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Documents() {
  const isMobile = useIsMobile();

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('driver-documents');
    if (saved) return JSON.parse(saved) as Document[];
    return [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: '',
    dataValidade: '',
    renovacaoMeses: 12,
    notas: '',
  });

  useEffect(() => {
    localStorage.setItem('driver-documents', JSON.stringify(documents));
  }, [documents]);

  function handleSave(): void {
    if (!form.nome || !form.dataValidade) return;

    if (editingId) {
      setDocuments((prev) =>
        prev.map((d) => d.id === editingId ? { ...form, id: editingId } : d)
      );
      setEditingId(null);
    } else {
      const novo: Document = { ...form, id: crypto.randomUUID() };
      setDocuments((prev) => [...prev, novo]);
    }

    setForm({ nome: '', dataValidade: '', renovacaoMeses: 12, notas: '' });
    setShowForm(false);
  }

  function handleEdit(doc: Document): void {
    setForm({
      nome: doc.nome,
      dataValidade: doc.dataValidade,
      renovacaoMeses: doc.renovacaoMeses,
      notas: doc.notas,
    });
    setEditingId(doc.id);
    setShowForm(true);
  }

  function handleDelete(id: string): void {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  function handlePredefinido(nome: string, meses: number): void {
    setForm({ nome, dataValidade: '', renovacaoMeses: meses, notas: '' });
    setEditingId(null);
    setShowForm(true);
  }

  // Ordena por urgência
  const documentosOrdenados = [...documents].sort((a, b) => {
    const sa = calcularStatus(a);
    const sb = calcularStatus(b);
    return sa.diasRestantes - sb.diasRestantes;
  });

  // Conta alertas
  const urgentes = documents.filter((d) => {
    const s = calcularStatus(d);
    return s.status === 'urgente' || s.status === 'vencido';
  }).length;

  const avisos = documents.filter((d) => calcularStatus(d).status === 'aviso').length;

  const s = isMobile ? mobileStyles : desktopStyles;

  const statusConfig: Record<AlertStatus, { cor: string; bg: string; border: string; label: string }> = {
    ok: { cor: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Válido' },
    aviso: { cor: '#854d0e', bg: '#fefce8', border: '#fde047', label: 'Renovar em breve' },
    urgente: { cor: '#b91c1c', bg: '#fef2f2', border: '#fca5a5', label: 'Urgente' },
    vencido: { cor: '#ffffff', bg: '#dc2626', border: '#dc2626', label: 'Vencido' },
  };

  return (
    <div>
      <header style={s.header}>
        <div style={{ flex: 1 }}>
          <p style={s.eyebrow}>Document Control</p>
          <h1 style={s.title}>Documentos</h1>
          {!isMobile && (
            <p style={s.subtitle}>
              Controla as validades dos teus documentos TVDE e nunca sejas bloqueado por documentação em falta.
            </p>
          )}
        </div>
        <button style={s.addButton} onClick={() => { setShowForm(true); setEditingId(null); setForm({ nome: '', dataValidade: '', renovacaoMeses: 12, notas: '' }); }}>
          {isMobile ? '+ Doc' : '+ Adicionar Documento'}
        </button>
      </header>

      {/* Resumo de alertas */}
      {documents.length > 0 && (
        <section style={s.alertGrid}>
          <div style={{ ...s.alertCard, background: urgentes > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${urgentes > 0 ? '#fca5a5' : '#86efac'}` }}>
            <p style={s.alertLabel}>Urgentes / Vencidos</p>
            <p style={{ ...s.alertValue, color: urgentes > 0 ? '#dc2626' : '#16a34a' }}>{urgentes}</p>
          </div>
          <div style={{ ...s.alertCard, background: avisos > 0 ? '#fefce8' : '#f0fdf4', border: `1px solid ${avisos > 0 ? '#fde047' : '#86efac'}` }}>
            <p style={s.alertLabel}>Renovar em breve</p>
            <p style={{ ...s.alertValue, color: avisos > 0 ? '#854d0e' : '#16a34a' }}>{avisos}</p>
          </div>
          <div style={{ ...s.alertCard, background: '#f0fdf4', border: '1px solid #86efac' }}>
            <p style={s.alertLabel}>Válidos</p>
            <p style={{ ...s.alertValue, color: '#16a34a' }}>{documents.length - urgentes - avisos}</p>
          </div>
        </section>
      )}

      {/* Formulário */}
      {showForm && (
        <section style={s.formCard}>
          <h2 style={s.formTitle}>{editingId ? '✏️ Editar Documento' : '➕ Novo Documento'}</h2>

          {/* Atalhos pré-definidos */}
          {!editingId && (
            <div style={s.predefinidos}>
              <p style={s.predefinidosLabel}>Documentos TVDE comuns:</p>
              <div style={s.predefinidosGrid}>
                {documentosPredefinidos.map((d) => (
                  <button key={d.nome} style={s.predefinidoBtn} onClick={() => handlePredefinido(d.nome, d.renovacaoMeses)}>
                    {d.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={s.formGrid}>
            <label style={s.label}>
              Nome do documento
              <input
                style={s.input}
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Certificado de Registo Criminal"
              />
            </label>

            <label style={s.label}>
              Data de validade
              <input
                style={s.input}
                type="date"
                value={form.dataValidade}
                onChange={(e) => setForm({ ...form, dataValidade: e.target.value })}
              />
            </label>

            <label style={s.label}>
              Renovação a cada (meses)
              <input
                style={s.input}
                type="number"
                min="1"
                max="120"
                value={form.renovacaoMeses}
                onChange={(e) => setForm({ ...form, renovacaoMeses: Number(e.target.value) })}
              />
            </label>

            <label style={s.label}>
              Notas (opcional)
              <input
                style={s.input}
                type="text"
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Ex: Pedir na PSP, custo €10"
              />
            </label>
          </div>

          <div style={s.formActions}>
            <button style={s.cancelBtn} onClick={() => { setShowForm(false); setEditingId(null); }}>
              Cancelar
            </button>
            <button style={s.saveBtn} onClick={handleSave}>
              {editingId ? 'Guardar alterações' : 'Adicionar documento'}
            </button>
          </div>
        </section>
      )}

      {/* Lista de documentos */}
      {documents.length === 0 && !showForm && (
        <section style={s.emptyCard}>
          <p style={s.emptyTitle}>📄 Sem documentos registados</p>
          <p style={s.emptySubtitle}>Adiciona os teus documentos TVDE para nunca perderes uma validade.</p>
          <div style={s.predefinidosGrid}>
            {documentosPredefinidos.map((d) => (
              <button key={d.nome} style={s.predefinidoBtn} onClick={() => { handlePredefinido(d.nome, d.renovacaoMeses); }}>
                {d.nome}
              </button>
            ))}
          </div>
        </section>
      )}

      {documentosOrdenados.map((doc) => {
        const { diasRestantes, status, dataRenovacao } = calcularStatus(doc);
        const config = statusConfig[status];

        return (
          <article key={doc.id} style={{ ...s.docCard, background: config.bg, border: `1px solid ${config.border}` }}>
            <div style={s.docHeader}>
              <div style={{ flex: 1 }}>
                <div style={s.docTitleRow}>
                  <h3 style={s.docName}>{doc.nome}</h3>
                  <span style={{ ...s.statusBadge, background: config.bg, color: config.cor, border: `1px solid ${config.border}` }}>
                    {config.label}
                  </span>
                </div>

                <div style={s.docMeta}>
                  <span>
                    📅 Válido até: <strong>{new Date(doc.dataValidade).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong>
                  </span>
                  {diasRestantes >= 0 ? (
                    <span style={{ color: config.cor, fontWeight: 800 }}>
                      {diasRestantes === 0 ? 'Vence hoje!' : `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`}
                    </span>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 800 }}>
                      Vencido há {Math.abs(diasRestantes)} dia{Math.abs(diasRestantes) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {status !== 'vencido' && (
                  <p style={s.renovacaoInfo}>
                    🔄 Renovar antes de: <strong>{dataRenovacao}</strong> · Renovação a cada {doc.renovacaoMeses} meses
                  </p>
                )}

                {status === 'vencido' && (
                  <p style={{ ...s.renovacaoInfo, color: '#dc2626', fontWeight: 800 }}>
                    ⚠️ Documento vencido — pode causar bloqueio da app!
                  </p>
                )}

                {doc.notas && (
                  <p style={s.notas}>💬 {doc.notas}</p>
                )}
              </div>

              <div style={s.docActions}>
                <button style={s.editBtn} onClick={() => handleEdit(doc)}>✏️</button>
                <button style={s.deleteBtn} onClick={() => handleDelete(doc.id)}>🗑️</button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const desktopStyles: Styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' },
  eyebrow: { margin: 0, fontSize: '12px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6366f1' },
  title: { margin: '8px 0', fontSize: '42px', fontWeight: 900, letterSpacing: '-0.04em' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '16px', lineHeight: 1.6 },
  addButton: { padding: '14px 18px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 16px 34px rgba(79,70,229,0.25)' },
  alertGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' },
  alertCard: { padding: '18px 20px', borderRadius: '18px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' },
  alertLabel: { margin: '0 0 6px', fontSize: '12px', fontWeight: 800, color: '#64748b' },
  alertValue: { margin: 0, fontSize: '32px', fontWeight: 900 },
  formCard: { padding: '24px', borderRadius: '24px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(15,23,42,0.06)', marginBottom: '20px' },
  formTitle: { margin: '0 0 20px', fontSize: '20px', fontWeight: 900 },
  predefinidos: { marginBottom: '20px', padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' },
  predefinidosLabel: { margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#64748b' },
  predefinidosGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  predefinidoBtn: { padding: '8px 14px', borderRadius: '10px', border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', fontWeight: 800, cursor: 'pointer', fontSize: '13px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' },
  label: { display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#475569' },
  input: { padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' },
  formActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: 800, cursor: 'pointer' },
  saveBtn: { padding: '12px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', fontWeight: 900, cursor: 'pointer' },
  emptyCard: { padding: '32px', borderRadius: '24px', background: '#ffffff', border: '1px solid #e5e7eb', textAlign: 'center', marginBottom: '20px' },
  emptyTitle: { margin: '0 0 8px', fontSize: '20px', fontWeight: 900 },
  emptySubtitle: { margin: '0 0 20px', color: '#64748b', lineHeight: 1.6 },
  docCard: { padding: '20px 24px', borderRadius: '20px', marginBottom: '12px' },
  docHeader: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  docTitleRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' },
  docName: { margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' },
  statusBadge: { padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 800 },
  docMeta: { display: 'flex', gap: '20px', fontSize: '14px', color: '#475569', fontWeight: 600, marginBottom: '6px', flexWrap: 'wrap' },
  renovacaoInfo: { margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 },
  notas: { margin: '6px 0 0', fontSize: '13px', color: '#64748b', fontStyle: 'italic' },
  docActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  editBtn: { padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '16px' },
  deleteBtn: { padding: '8px 10px', borderRadius: '10px', border: 'none', background: '#fee2e2', cursor: 'pointer', fontSize: '16px' },
};

const mobileStyles: Styles = {
  ...desktopStyles,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  title: { margin: '4px 0 0', fontSize: '26px', fontWeight: 900 },
  addButton: { padding: '10px 14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' },
  alertGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' },
  alertCard: { padding: '14px', borderRadius: '16px' },
  alertValue: { margin: 0, fontSize: '24px', fontWeight: 900 },
  formCard: { padding: '18px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e5e7eb', marginBottom: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '16px' },
  docCard: { padding: '16px', borderRadius: '18px', marginBottom: '10px' },
  docName: { margin: 0, fontSize: '15px', fontWeight: 900, color: '#0f172a' },
  docMeta: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#475569', fontWeight: 600, marginBottom: '4px' },
};
