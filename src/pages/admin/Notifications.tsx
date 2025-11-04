import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { ImagePlus, UploadCloud, X } from 'lucide-react';

type Audience = 'all'|'topic'|'user'|'segment';

interface HistoryItem {
  id: number;
  title: string;
  body: string;
  image_url?: string | null;
  audience: Audience;
  topic?: string | null;
  segment?: 'paid'|'free'|null;
  status: 'queued'|'sent'|'failed';
  total_targets: number;
  success_count: number;
  failure_count: number;
  created_at_ist: string;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [audience, setAudience] = useState<Audience>('all');
  const [topic, setTopic] = useState('');
  const [userIds, setUserIds] = useState(''); // CSV
  const [segment, setSegment] = useState<'paid'|'free'>('paid');

  const [dataRaw, setDataRaw] = useState(''); // JSON string
  const [dataError, setDataError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hPage, setHPage] = useState(1);
  const [hTotal, setHTotal] = useState(0);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ---- Upload UI helpers ----
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validDataJson = useMemo(() => {
    if (!dataRaw.trim()) return null;
    try {
      setDataError(null);
      return JSON.parse(dataRaw);
    } catch (e: any) {
      setDataError(e.message);
      return null;
    }
  }, [dataRaw]);

  const canSend = useMemo(() => {
    if (!title.trim() || !body.trim()) return false;
    if (audience === 'topic' && !topic.trim()) return false;
    if (audience === 'user' && !userIds.trim()) return false;
    if (audience === 'segment' && !segment) return false;
    if (dataRaw.trim() && dataError) return false;
    return true;
  }, [title, body, audience, topic, userIds, segment, dataRaw, dataError]);

  const fetchHistory = async (page = 1) => {
    try {
      const res = await axios.get(`${API}/notifications`, { params: { page, limit: 20 } });
      setHistory(res.data.items || []);
      setHPage(res.data.page || 1);
      setHTotal(res.data.total || 0);
    } catch (e: any) {
      console.error('history error', e?.message);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  const handlePreviewCount = async () => {
    setPreviewLoading(true);
    setPreviewCount(null);
    try {
      const params: any = { audience };
      if (audience === 'topic') params.topic = topic;
      if (audience === 'user') params.userIds = userIds;
      if (audience === 'segment') params.segment = segment;

      const res = await axios.get(`${API}/notifications/audience-count`, { params });
      setPreviewCount(res.data.count);
    } catch (e:any) {
      console.error('preview error', e?.message);
      setPreviewCount(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ---------- Image handling (styled button + drag & drop + preview) ----------
  const acceptTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_MB = 5;

  const setPreviewFromFile = (file: File | null) => {
    setImageFile(file);
    if (!file) return setPreviewUrl(null);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateAndSet = (file: File | null) => {
    if (!file) {
      setPreviewFromFile(null);
      return;
    }
    if (!acceptTypes.includes(file.type)) {
      alert('Please choose a JPG/PNG/WebP/GIF image.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Please choose an image smaller than ${MAX_MB} MB.`);
      return;
    }
    setPreviewFromFile(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSet(e.target.files?.[0] || null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSet(file || null);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = () => {
    setPreviewFromFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // wherever you send the notification
  // ✨ DO NOT set 'Content-Type' manually; let the browser add boundary.
  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append('title', title.trim());
      form.append('body', body.trim());
      form.append('audience', audience);

      if (audience === 'user') {
        const ids = userIds
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map(n => Number(n))
          .filter(n => Number.isFinite(n));
        form.append('userIds', JSON.stringify(ids));
      }

      if (audience === 'segment') {
        form.append('segment', segment);
      }

      if (audience === 'topic' && topic.trim()) {
        form.append('topic', topic.trim());
      }

      if (imageFile) {
        form.append('image', imageFile, imageFile.name);
      }

      if (dataRaw && !dataError) {
        form.append('data', dataRaw);
      }

      const res = await axios.post(`${API}/notifications/send`, form);

      // reset UI and refresh history
      setTitle('');
      setBody('');
      setUserIds('');
      setTopic('');
      removeImage();
      setDataRaw('');
      fetchHistory(1);

      alert(`Notification sent: success ${res.data.success}/${res.data.total}`);
    } catch (e: any) {
      console.error('send failed', e);
      alert(`Failed: ${e?.response?.data?.message || e.message}`);
    } finally {
      setSending(false);
    }
  };

  const debugForm = (form: FormData) => {
    for (const [k, v] of form.entries()) {
      console.log(k, v);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Send push notifications to your users (FCM)</p>
      </header>

      {/* Compose */}
      <div className="rounded-xl border p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
            />
          </div>

          {/* Modern Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image (optional)</label>

            {/* Button + meta */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.99]"
              >
                <UploadCloud className="h-5 w-5" />
                Choose Image
              </button>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileInputChange}
              />

              {imageFile && (
                <span className="text-xs text-muted-foreground">
                  {imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>

            {/* Drag & Drop area */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-all
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}
              `}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            >
              <ImagePlus className="mb-2 h-7 w-7 opacity-70" />
              <p className="text-sm">
                Drag & drop image here, or <span className="font-medium text-blue-600 underline">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, GIF up to {MAX_MB}MB</p>
            </div>

            {/* Preview card */}
            {previewUrl && (
              <div className="relative mt-3 w-44">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-44 w-44 rounded-xl border object-cover shadow-sm transition-transform hover:scale-[1.02]"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                  aria-label="Remove image"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Body</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message body..."
          />
        </div>

        {/* Audience */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Audience</label>
          <div className="flex flex-wrap gap-3">
            {(['all','user','segment'] as Audience[]).map(a => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="aud"
                  checked={audience === a}
                  onChange={() => setAudience(a)}
                />
                {a}
              </label>
            ))}
          </div>

       

          {audience === 'user' && (
            <div className="mt-2">
              <textarea
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
                placeholder="Comma separated user IDs, e.g. 101,102,103"
                rows={2}
              />
            </div>
          )}

          {audience === 'segment' && (
            <div className="mt-2">
              <select
                className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                value={segment}
                onChange={(e) => setSegment(e.target.value as any)}
              >
                <option value="paid">Paid (active plan)</option>
                <option value="free">Free (no active plan)</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm transition hover:bg-slate-50"
              onClick={handlePreviewCount}
              disabled={previewLoading}
            >
              {previewLoading ? 'Computing…' : 'Preview audience size'}
            </button>
            {previewCount !== null && (
              <span className="text-sm text-muted-foreground">
                {previewCount === -1 ? 'Unknown (topic audience)' : `${previewCount} users`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="rounded-xl bg-blue-600 text-white px-4 py-2 font-medium shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.99]"
            onClick={handleSend}
            disabled={!canSend || sending}
          >
            {sending ? 'Sending…' : 'Send Notification'}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">History</h2>
          <button className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-slate-50" onClick={() => fetchHistory(1)}>Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Audience</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Targets</th>
                <th className="py-2 pr-4">Success</th>
                <th className="py-2 pr-4">Failure</th>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Image</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr><td colSpan={9} className="py-6 text-center text-muted-foreground">No notifications yet</td></tr>
              )}
              {history.map(h => (
                <tr key={h.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{h.id}</td>
                  <td className="py-2 pr-4">
                    <div className="font-medium">{h.title}</div>
                    <div className="max-w-[380px] truncate text-xs text-muted-foreground">{h.body}</div>
                  </td>
                  <td className="py-2 pr-4">
                    {h.audience}
                    {h.audience === 'segment' && h.segment ? ` (${h.segment})` : ''}
                    {h.audience === 'topic' && h.topic ? ` (${h.topic})` : ''}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs ${
                      h.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                      h.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{h.status}</span>
                  </td>
                  <td className="py-2 pr-4">{h.total_targets}</td>
                  <td className="py-2 pr-4">{h.success_count}</td>
                  <td className="py-2 pr-4">{h.failure_count}</td>
                  <td className="py-2 pr-4">{h.created_at_ist}</td>
                  <td className="py-2 pr-4">
                    {h.image_url ? (
                      <a className="text-blue-600 underline" href={h.image_url} target="_blank" rel="noreferrer">view</a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hTotal > history.length && (
          <div className="mt-3 flex items-center gap-2">
            <button
              className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-slate-50"
              onClick={() => { const p = Math.max(1, hPage - 1); setHPage(p); fetchHistory(p); }}
              disabled={hPage <= 1}
            >
              Prev
            </button>
            <div className="text-sm text-muted-foreground">Page {hPage}</div>
            <button
              className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-slate-50"
              onClick={() => { const p = hPage + 1; setHPage(p); fetchHistory(p); }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
