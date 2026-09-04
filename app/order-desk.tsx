'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  CupSoda,
  ImagePlus,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Sparkles,
  UsersRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress, ProgressValue } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

type Meal = { id: string; name: string; note: string; price: number; accent: string };
type Member = { name: string; initials: string; amount: number; paid: boolean; color: string };

const meals: Meal[] = [
  { id: 'com-ga', name: 'Cơm gà xối mỡ', note: 'Kèm canh & dưa góp', price: 42_000, accent: 'bg-amber-100 text-amber-800' },
  { id: 'bun-bo', name: 'Bún bò Huế', note: 'Chọn độ cay khi đặt', price: 45_000, accent: 'bg-rose-100 text-rose-800' },
  { id: 'mi-tron', name: 'Mì trộn đặc biệt', note: 'Thêm trứng +8.000đ', price: 39_000, accent: 'bg-lime-100 text-lime-800' },
  { id: 'tra-dao', name: 'Trà đào cam sả', note: 'Ít ngọt mặc định', price: 25_000, accent: 'bg-sky-100 text-sky-800' },
];

const initialMembers: Member[] = [
  { name: 'Hải', initials: 'H', amount: 39_000, paid: true, color: 'bg-cyan-600' },
  { name: 'An', initials: 'A', amount: 39_000, paid: true, color: 'bg-violet-600' },
  { name: 'Linh', initials: 'L', amount: 39_000, paid: true, color: 'bg-orange-500' },
  { name: 'Minh', initials: 'M', amount: 39_000, paid: false, color: 'bg-fuchsia-600' },
  { name: 'Nam', initials: 'N', amount: 39_000, paid: true, color: 'bg-emerald-600' },
  { name: 'Thư', initials: 'T', amount: 39_000, paid: true, color: 'bg-pink-600' },
];

const formatMoney = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;

export function OrderDesk() {
  const [selected, setSelected] = useState<string[]>(['bun-bo', 'tra-dao']);
  const [quantities, setQuantities] = useState<Record<string, number>>({ 'bun-bo': 1, 'tra-dao': 1 });
  const [customMeal, setCustomMeal] = useState('');
  const [customMeals, setCustomMeals] = useState<string[]>([]);
  const [method, setMethod] = useState<'equal' | 'item'>('equal');
  const [totalBill, setTotalBill] = useState(468_000);
  const [totalItems, setTotalItems] = useState(13);
  const [myPaymentTicked, setMyPaymentTicked] = useState(false);
  const [sessionPhase, setSessionPhase] = useState<'open' | 'locked' | 'payment'>('open');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [sessionTitle, setSessionTitle] = useState('Đồ ăn trưa · 04/09');
  const [notice, setNotice] = useState<string | null>(null);

  const participantCount = 12;
  const equalShare = Math.ceil(totalBill / participantCount / 1_000) * 1_000;
  const itemShare = useMemo(
    () => selected.reduce((sum, id) => sum + (meals.find((meal) => meal.id === id)?.price ?? 0) * (quantities[id] ?? 1), 0),
    [quantities, selected],
  );
  const myAmount = method === 'equal' ? equalShare : itemShare;
  const paidCount = initialMembers.filter((member) => member.paid).length + (myPaymentTicked ? 1 : 0);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown }, options: { signal: AbortSignal }) => unknown } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'mark_my_food_order_paid',
      title: 'Đánh dấu đã chuyển tiền',
      description: 'Đánh dấu khoản tiền của tôi trong phiên đặt đồ hiện tại là đã chuyển.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: () => { setMyPaymentTicked(true); return { status: 'reported_paid', amount: myAmount, currency: 'VND' }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [myAmount]);

  function toggleMeal(id: string, checked: boolean) {
    setSelected((current) => checked ? [...current, id] : current.filter((selectedId) => selectedId !== id));
    setQuantities((current) => ({ ...current, [id]: checked ? current[id] ?? 1 : 0 }));
  }

  function updateQuantity(id: string, direction: -1 | 1) {
    setQuantities((current) => ({ ...current, [id]: Math.max(1, (current[id] ?? 1) + direction) }));
  }

  function addCustomMeal() {
    const value = customMeal.trim();
    if (!value) return;
    setCustomMeals((current) => [...current, value]);
    setCustomMeal('');
  }

  function createSession() {
    const title = newSessionTitle.trim();
    if (!title) return;
    setSessionTitle(title);
    setSessionPhase('open');
    setSelected([]);
    setQuantities({});
    setCustomMeals([]);
    setNewSessionTitle('');
    setIsCreateOpen(false);
    setNotice(`Đã tạo phiên “${title}”. Mời mọi người chọn món.`);
  }

  function advanceSession() {
    if (sessionPhase === 'open') { setSessionPhase('locked'); setNotice('Đã khóa danh sách món. Bạn có thể nhập hóa đơn thực tế.'); }
    else if (sessionPhase === 'locked') { setSessionPhase('payment'); setNotice('Đã mở phần thanh toán cho mọi người.'); }
    else setNotice('Phiên sẵn sàng hoàn tất khi mọi người đã tick chuyển tiền.');
  }

  function toggleMyPayment() {
    setMyPaymentTicked((current) => !current);
    setNotice(myPaymentTicked ? 'Đã bỏ đánh dấu chuyển tiền.' : 'Đã ghi nhận bạn báo đã chuyển tiền.');
  }

  return (
    <main className="min-h-screen bg-[#f3f7fb] text-[#162238]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[242px_minmax(0,1fr)]">
        <aside className="border-b border-[#d9e2ef] bg-[#10213d] px-5 py-5 text-white lg:min-h-screen lg:border-r lg:border-b-0 lg:px-4">
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center gap-3 px-2"><div className="grid size-10 place-items-center rounded-2xl bg-[#d8ff70] text-[#10213d] shadow-[0_8px_20px_rgba(216,255,112,0.24)]"><CupSoda className="size-5" /></div><div><p className="text-base font-bold tracking-tight">Ăn gì đây?</p><p className="text-xs text-blue-200">Nhóm Mây Mây · 30 người</p></div></div>
            <Button size="sm" className="bg-[#d8ff70] text-[#10213d] hover:bg-[#e6ff9c] lg:mt-8 lg:w-full" onClick={() => setIsCreateOpen(true)}><Plus /> Tạo phiên mới</Button>
          </div>
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col" aria-label="Điều hướng chính"><button className="nav-item nav-item-active"><LayoutDashboard /> Hôm nay</button><button className="nav-item"><CalendarDays /> Lịch sử</button><button className="nav-item"><ReceiptText /> Thống kê</button></nav>
          <div className="mt-8 hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block"><div className="flex items-center justify-between text-xs text-blue-100"><span>Tháng 9</span><Sparkles className="size-4 text-[#d8ff70]" /></div><p className="mt-3 text-2xl font-bold">8</p><p className="text-sm text-blue-100">phiên đã hoàn tất</p><div className="mt-4 h-px bg-white/10" /><p className="mt-3 text-sm font-semibold text-[#d8ff70]">Hải đang dẫn đầu</p><p className="mt-1 text-xs leading-5 text-blue-100">Đã đứng ra đặt 3 lần trong tháng này.</p></div>
          <div className="mt-8 hidden items-center gap-3 px-2 lg:flex"><div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#ffb9b2] to-[#d3667b] text-xs font-bold">M</div><div><p className="text-sm font-semibold">Mai Anh</p><p className="text-xs text-blue-200">Thành viên</p></div></div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-7 lg:px-10 lg:py-8">
          <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow">PHIÊN ĐANG MỞ</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{sessionTitle}</h1></div><div className="flex flex-wrap items-center gap-2"><span className="status-pill"><Clock3 className="size-3.5" /> Còn 23 phút</span><Button variant="outline" size="sm" onClick={advanceSession}>{sessionPhase === 'open' ? 'Khóa danh sách' : sessionPhase === 'locked' ? 'Mở thanh toán' : 'Nhắc mọi người'}<ChevronRight /></Button></div></header>
          {notice && <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#cde4a4] bg-[#f3ffd9] px-4 py-3 text-sm text-[#39540a]" role="status"><span>{notice}</span><button className="font-semibold underline" onClick={() => setNotice(null)}>Đóng</button></div>}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <section className="surface-card overflow-hidden"><div className="grid gap-5 p-5 sm:grid-cols-[142px_minmax(0,1fr)] sm:p-6"><img src="/lunch-session.png" alt="Bữa trưa văn phòng" className="h-36 w-full rounded-2xl object-cover sm:size-[142px]" /><div className="min-w-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold text-[#5c6a80]">Quán hôm nay</p><h2 className="mt-1 text-xl font-bold">Cơm Gà Sân Thượng</h2></div><span className="rounded-full bg-[#e2efff] px-3 py-1 text-xs font-bold text-[#245a9d]">Hải đặt</span></div><p className="mt-2 text-sm leading-6 text-[#66738a]">Tick món có sẵn bên dưới. Nếu muốn gọi món khác, hãy ghi rõ tên món và số lượng.</p><div className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-[#46536a]"><span className="inline-flex items-center gap-1.5"><UsersRound className="size-4 text-[#356da9]" /> 12 người tham gia</span><span className="inline-flex items-center gap-1.5"><Clock3 className="size-4 text-[#356da9]" /> Chốt lúc 11:15</span></div></div></div></section>
              <section className="surface-card p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">BƯỚC 1</p><h2 className="mt-1 text-xl font-bold">Bạn muốn ăn gì?</h2></div><span className="text-sm text-[#66738a]">Có thể chọn nhiều món</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{meals.map((meal) => { const checked = selected.includes(meal.id); return <div key={meal.id} className={`meal-card ${checked ? 'meal-card-selected' : ''}`}><label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"><Checkbox checked={checked} onCheckedChange={(value) => toggleMeal(meal.id, value === true)} /><span className="min-w-0"><span className="flex items-center gap-2"><span className={`grid size-7 place-items-center rounded-lg text-xs font-bold ${meal.accent}`}>{meal.name.slice(0, 1)}</span><span className="font-bold">{meal.name}</span></span><span className="mt-1 block text-sm text-[#718096]">{meal.note}</span><span className="mt-2 block text-sm font-semibold text-[#294161]">{formatMoney(meal.price)}</span></span></label>{checked && <div className="flex items-center gap-1 rounded-lg bg-[#eef3f9] p-1"><button aria-label={`Giảm số lượng ${meal.name}`} className="quantity-button" onClick={() => updateQuantity(meal.id, -1)}>−</button><span className="w-5 text-center text-sm font-bold">{quantities[meal.id] ?? 1}</span><button aria-label={`Tăng số lượng ${meal.name}`} className="quantity-button" onClick={() => updateQuantity(meal.id, 1)}>+</button></div>}</div>; })}</div><div className="mt-4 rounded-xl border border-dashed border-[#bccadd] bg-[#f8fbff] p-4"><div className="flex items-center gap-2 font-semibold"><Plus className="size-4 text-[#356da9]" /> Món khác</div><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={customMeal} onChange={(event) => setCustomMeal(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addCustomMeal(); }} placeholder="Ví dụ: Cơm sườn trứng x1" /><Button variant="secondary" onClick={addCustomMeal}>Thêm món</Button></div>{customMeals.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{customMeals.map((meal) => <span key={meal} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[#46536a] ring-1 ring-[#d8e2ee]">{meal}</span>)}</div>}</div></section>
              <section className="surface-card p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">BƯỚC 2 · NGƯỜI ĐẶT</p><h2 className="mt-1 text-xl font-bold">Chốt hóa đơn & chia tiền</h2></div><span className="rounded-full bg-[#fff2ca] px-3 py-1 text-xs font-bold text-[#80580b]">{sessionPhase === 'open' ? 'Chưa khóa món' : 'Đã khóa món'}</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="field-label">Tổng hóa đơn thực tế<Input inputMode="numeric" value={totalBill} onChange={(event) => setTotalBill(Number(event.target.value.replace(/\D/g, '')) || 0)} /></label><label className="field-label">Tổng số lượng món<Input inputMode="numeric" value={totalItems} onChange={(event) => setTotalItems(Number(event.target.value.replace(/\D/g, '')) || 0)} /></label></div><p className="mt-2 text-xs leading-5 text-[#718096]">Tổng số lượng dùng để người đặt kiểm tra đơn với quán, không dùng để chia đều tiền.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={() => setMethod('equal')} className={`method-card ${method === 'equal' ? 'method-card-active' : ''}`}><span className="grid size-9 place-items-center rounded-xl bg-[#e2efff] text-[#245a9d]"><UsersRound className="size-4" /></span><span><strong>Chia đều</strong><small>Tổng hóa đơn / người tham gia</small></span><span className="method-radio" /></button><button onClick={() => setMethod('item')} className={`method-card ${method === 'item' ? 'method-card-active' : ''}`}><span className="grid size-9 place-items-center rounded-xl bg-[#f0e6ff] text-[#764cb6]"><ReceiptText className="size-4" /></span><span><strong>Theo món</strong><small>Nhập giá theo từng món đã chọn</small></span><span className="method-radio" /></button></div></section>
            </div>
            <div className="space-y-6">
              <section className="surface-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">BƯỚC 3</p><h2 className="mt-1 text-lg font-bold">Thanh toán</h2></div><CreditCard className="size-5 text-[#356da9]" /></div><div className="mt-5 rounded-2xl bg-[#10213d] p-5 text-white"><p className="text-sm text-blue-100">Bạn cần chuyển</p><p className="mt-1 text-3xl font-bold tracking-tight">{formatMoney(myAmount)}</p><p className="mt-2 text-xs leading-5 text-blue-100">{method === 'equal' ? `${formatMoney(totalBill)} ÷ ${participantCount} người, làm tròn nghìn.` : 'Theo các món bạn đã chọn, chưa gồm phí phát sinh.'}</p></div><div className="mt-4 rounded-2xl border border-[#d8e2ee] bg-[#f8fbff] p-4 text-center"><div className="mx-auto grid size-32 place-items-center rounded-xl bg-[repeating-linear-gradient(45deg,#10213d_0_5px,#fff_5px_10px)] p-3"><div className="grid size-16 place-items-center bg-white text-[#10213d]"><span className="text-xs font-black">HAI<br/>FOOD</span></div></div><p className="mt-3 text-sm font-bold">Vietcombank · Hải Nguyễn</p><p className="mt-1 text-xs text-[#66738a]">Nhập QR thật sau khi đã đặt món</p><Button variant="outline" size="sm" className="mt-3"><ImagePlus /> Tải ảnh QR</Button></div><button onClick={toggleMyPayment} className={`mt-4 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${myPaymentTicked ? 'border-[#b8df65] bg-[#f3ffd9]' : 'border-[#d8e2ee] bg-white hover:border-[#9fc0e7]'}`}><span className={`grid size-6 place-items-center rounded-full ${myPaymentTicked ? 'bg-[#76a918] text-white' : 'border border-[#aebdce] text-transparent'}`}><Check className="size-4" /></span><span><span className="block text-sm font-bold">{myPaymentTicked ? 'Bạn đã chuyển tiền' : 'Đánh dấu đã chuyển tiền'}</span><span className="block text-xs text-[#66738a]">Bạn có thể bỏ đánh dấu nếu bấm nhầm.</span></span></button></section>
              <section className="surface-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">TIẾN ĐỘ</p><h2 className="mt-1 text-lg font-bold">Ai đã chuyển?</h2></div><span className="text-sm font-bold text-[#356da9]">{paidCount}/{participantCount}</span></div><Progress className="mt-4 gap-2" value={(paidCount / participantCount) * 100}><ProgressValue /></Progress><div className="mt-4 space-y-3">{initialMembers.map((member) => <div className="flex items-center justify-between" key={member.name}><div className="flex items-center gap-2.5"><span className={`grid size-7 place-items-center rounded-full text-xs font-bold text-white ${member.color}`}>{member.initials}</span><span className="text-sm font-semibold">{member.name}</span></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${member.paid ? 'bg-[#effad6] text-[#527d0a]' : 'bg-[#fff1eb] text-[#a34726]'}`}>{member.paid ? 'Đã chuyển' : 'Chưa trả'}</span></div>)}</div><p className="mt-4 rounded-lg bg-[#f6f8fb] px-3 py-2 text-xs leading-5 text-[#66738a]">Danh sách chỉ ghi nhận trạng thái thành viên tự tick. Người đặt có thể đối soát lại với tài khoản ngân hàng.</p></section>
              <section className="rounded-2xl bg-[#d8ff70] p-5 text-[#18300b] shadow-[0_16px_32px_rgba(156,205,57,0.16)]"><p className="text-sm font-bold">Mẹo nhỏ</p><p className="mt-1 text-sm leading-6">Khi mọi người đã tick xong, Hải chỉ cần kiểm tra tổng tiền và bấm hoàn tất phiên.</p><Button variant="outline" size="sm" className="mt-3 border-[#95bc36] bg-white/45 hover:bg-white">Xem lịch sử phiên</Button></section>
            </div>
          </div>
        </section>
      </div>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}><DialogContent className="max-w-md p-6"><DialogHeader><DialogTitle>Tạo phiên đặt đồ</DialogTitle><DialogDescription>Mỗi phiên có mã dữ liệu riêng nên không bị lẫn với các đợt khác trong ngày.</DialogDescription></DialogHeader><div className="mt-2 space-y-4"><label className="field-label">Tên phiên<Input autoFocus value={newSessionTitle} onChange={(event) => setNewSessionTitle(event.target.value)} placeholder="Ví dụ: Trà sữa chiều 04/09" /></label><label className="field-label">Ghi chú cho nhóm<Textarea placeholder="Hạn chốt, link menu hoặc lưu ý..." /></label></div><DialogFooter className="mt-2"><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button><Button onClick={createSession}><Plus /> Tạo phiên</Button></DialogFooter></DialogContent></Dialog>
    </main>
  );
}
