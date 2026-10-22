import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  CreditCard,
  Expand,
  Filter,
  Grid2X2,
  HelpCircle,
  Image,
  Landmark,
  Laptop,
  Link,
  LockKeyhole,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  MoreVertical,
  Pause,
  Plane,
  Play,
  Plus,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Timer,
  User,
  UserPlus,
  Users,
  Utensils,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Round({
  label,
  onClick,
  children,
  className = "",
  pressed,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  pressed?: boolean;
}) {
  return (
    <button
      className={"ref-round " + className}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Popup({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>交互参考 · 仅使用本地演示数据。</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
function Ring({
  value = 36,
  label = "增长率",
  time,
}: {
  value?: number;
  label?: string;
  time?: string;
}) {
  return (
    <div className="ref-ring">
      <svg
        viewBox="0 0 160 160"
        aria-label={time ?? value + "% " + label}
        role="img"
      >
        <circle
          cx="80"
          cy="80"
          r="64"
          fill="none"
          stroke="currentColor"
          opacity=".13"
          strokeWidth="8"
        />
        <circle
          cx="80"
          cy="80"
          r="64"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={value * 4.02 + " 402"}
          transform="rotate(-90 80 80)"
        />
        <circle cx="80" cy="16" r="3" fill="#d31218" />
      </svg>
      <div>
        <strong>{time ?? value + "%"}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}
function Sparkline() {
  return (
    <svg
      viewBox="0 0 300 70"
      className="ref-sparkline"
      role="img"
      aria-label="股票价值走势，整体上涨9.3%"
    >
      <path
        d="M0 36 C6 28 10 23 16 31 S24 37 30 29 S40 27 45 41 S55 45 60 38 S70 36 75 45 S85 45 90 20 S101 20 105 24 S116 7 120 15 S131 20 135 30 S146 50 150 40 S160 44 165 53 S176 50 180 40 S190 27 195 32 S206 53 210 45 S220 12 225 18 S236 28 240 41 S250 61 255 52 S266 31 270 38 S281 52 285 45 S296 34 300 34"
        fill="none"
        stroke="#d31218"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function MiniBars() {
  return (
    <div
      className="mini-bars"
      role="img"
      aria-label="近期交易活动，12个周期的示例交易量"
    >
      {[19, 30, 42, 24, 17, 38, 23, 48, 66, 42, 29, 50].map((h, i) => (
        <i
          key={i}
          style={{ height: h }}
          className={i % 3 === 0 ? "signal-bar" : ""}
        />
      ))}
    </div>
  );
}
function RefNote({ name, author }: { name: string; author: string }) {
  return (
    <div className="reference-credit">
      <span>
        {name} <b>×</b> CREASE
      </span>
      <span>设计研究 / {author} · 配色转译与交互演示</span>
    </div>
  );
}

export function FinanceReference() {
  const [popup, setPopup] = useState<string | null>(null);
  const [period, setPeriod] = useState("本周");
  const [locked, setLocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState("团队");
  const [sent, setSent] = useState(false);
  const [year, setYear] = useState("2026");
  const open = (label: string) => {
    setSent(false);
    setPopup(label);
  };
  const plans = ["银行贷款", "财务记账", "人事管理"].filter((p) =>
    p.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div lang="zh-CN" className="finance-reference reference-canvas">
        <header className="finance-header">
          <div className="finance-identity">
            <Round label="打开页面菜单" onClick={() => open("工作空间")}>
              <Menu />
            </Round>
            <div className="finance-logo">
              N<span>º</span>
            </div>
            <h1>
              财务管理<small>概览</small>
            </h1>
          </div>
          <div className="finance-user">
            <Round label="新建交易" onClick={() => open("新建转账")}>
              <Plus />
            </Round>
            <span className="ref-user-avatar">LX</span>
            <div>
              Leng Jingxu<small>工作室负责人</small>
            </div>
          </div>
          <button className="finance-search" onClick={() => open("搜索交易")}>
            <RoundIcon>
              <Search />
            </RoundIcon>
            <span>搜索交易记录…</span>
          </button>
        </header>
        <section className="finance-welcome">
          <div className="finance-date">
            <span className="date-circle">22</span>
            <p>
              星期四，
              <br />
              十月
            </p>
            <i />
            <Button
              onClick={() =>
                document.getElementById("activity-manager")?.scrollIntoView({
                  behavior: matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "instant"
                    : "smooth",
                  block: "center",
                })
              }
            >
              查看我的任务 <ArrowRight />
            </Button>
            <Round
              label="打开日历"
              onClick={() => open("2026 年 10 月")}
              className="has-signal"
            >
              <CalendarDays />
            </Round>
          </div>
          <div className="finance-greeting">
            <h2>
              需要一点帮助？<span className="greeting-star">✳</span>
              <small>想了解什么，尽管问。</small>
            </h2>
            <Round label="打开财务助手" onClick={() => open("财务助手")}>
              <Mic />
            </Round>
          </div>
        </section>
        <div className="finance-body">
          <div className="finance-main">
            <div className="finance-upper">
              <div className="finance-rail">
                <div>
                  <CreditCard size={18} />
                  <button
                    aria-label="添加银行卡"
                    onClick={() => open("添加银行卡")}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <Round label="分享报表" onClick={() => open("分享报表")}>
                  <Share2 size={17} />
                </Round>
              </div>
              <section className="bank-card">
                <div className="bank-card-top">
                  <div className="ref-card-heading">
                    <strong className="visa">VISA</strong>
                    <button
                      className="ref-pill"
                      onClick={() => open("自动扣款")}
                    >
                      自动扣款 <ChevronDown size={12} />
                    </button>
                  </div>
                  <p>已关联主账户</p>
                  <strong className="bank-number">**** 2719</strong>
                  <div className="bank-actions">
                    <Button onClick={() => open("收款信息")}>收款</Button>
                    <Button
                      variant="secondary"
                      onClick={() => open("新建转账")}
                    >
                      转账
                    </Button>
                  </div>
                </div>
                <div className="bank-fee">
                  <div>
                    <small>每月固定费用</small>
                    <strong>
                      <em>$</em> 25.00
                    </strong>
                  </div>
                  <button onClick={() => open("银行卡限额")}>
                    <Settings2 size={15} />
                    <span>
                      调整
                      <br />
                      银行卡限额
                    </span>
                  </button>
                </div>
              </section>
              <section className="income-card">
                {[
                  {
                    label: "总收入",
                    value: period === "本周" ? "23,194.80" : "92,779.20",
                    icon: ArrowUpRight,
                  },
                  {
                    label: "总支出",
                    value: period === "本周" ? "8,145.20" : "32,580.80",
                    icon: ArrowRight,
                  },
                ].map((m, i) => (
                  <div className="income-half" key={m.label}>
                    <div className="ref-card-heading">
                      <RoundIcon>
                        <m.icon size={15} />
                      </RoundIcon>
                      <select
                        aria-label={m.label + "统计周期"}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                      >
                        <option>本周</option>
                        <option>本月</option>
                      </select>
                    </div>
                    <small>{m.label}</small>
                    <div className="income-value">
                      <strong>
                        <em>$</em> {m.value}
                      </strong>
                      {i === 1 && (
                        <button onClick={() => open("现金流明细")}>
                          <ArrowUpRight size={15} />
                          <span>
                            查看
                            <br />
                            图表明细
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </section>
              <div className="finance-micro">
                <button
                  className={"system-lock " + (locked ? "is-locked" : "")}
                  onClick={() => setLocked(!locked)}
                >
                  <LockKeyhole size={19} />
                  <span>{locked ? "已锁定" : "账户锁定"}</span>
                </button>
                <div className="growth">
                  <Ring />
                </div>
              </div>
            </div>
            <div className="finance-lower">
              <section className="annual-profit ref-soft">
                <div className="ref-card-heading">
                  <h2>年度收益</h2>
                  <select
                    aria-label="利润年份"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option>2026</option>
                    <option>2025</option>
                  </select>
                </div>
                <div className="profit-circles">
                  {(year === "2026"
                    ? ["14K", "9.3K", "6.8K", "4K"]
                    : ["12K", "8.2K", "5.4K", "3K"]
                  ).map((v, i) => (
                    <div key={i} className={"profit-circle circle-" + i}>
                      <span>
                        <em>$</em> {v}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <section
                className="activity-manager ref-soft"
                id="activity-manager"
              >
                <div className="ref-card-heading">
                  <h2>活动管理</h2>
                  <div className="ref-inline">
                    <Round label="活动详情" onClick={() => open("活动明细")}>
                      <MoreVertical size={15} />
                    </Round>
                    <Round label="展开活动" onClick={() => open("全部活动")}>
                      <Expand size={15} />
                    </Round>
                    <button
                      className="ref-pill"
                      onClick={() =>
                        setActivity(activity === "团队" ? "洞察" : "团队")
                      }
                    >
                      <Filter size={12} />
                      筛选
                    </button>
                  </div>
                </div>
                <div className="activity-toolbar">
                  <label>
                    <Search size={16} />
                    <input
                      aria-label="搜索活动"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="搜索活动…"
                    />
                  </label>
                  <div className="ref-inline">
                    {["团队", "洞察", "今天"].map((t) => (
                      <button
                        key={t}
                        className={
                          "ref-pill " + (activity === t ? "chosen" : "")
                        }
                        onClick={() => setActivity(t)}
                        aria-pressed={activity === t}
                      >
                        {t}
                        <i />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="activity-cards">
                  <article className="activity-money">
                    <strong>
                      <em>$</em>
                      {activity === "团队"
                        ? "43.20"
                        : activity === "洞察"
                          ? "68.40"
                          : "24.10"}
                      <small> USD</small>
                    </strong>
                    <MiniBars />
                    <div className="carousel-dots">
                      <i />
                      <i />
                      <i className="selected" />
                      <i />
                    </div>
                  </article>
                  <article className="business-plans">
                    <h3>经营计划</h3>
                    <div>
                      {plans.map((p, i) => (
                        <button key={p} onClick={() => open(p)}>
                          <span>
                            <Landmark size={12} />
                          </span>
                          <span>{p}</span>
                          {i === 0 && <ChevronDown size={10} />}
                        </button>
                      ))}
                      {!plans.length && (
                        <p className="ref-empty">没有匹配的活动。</p>
                      )}
                    </div>
                  </article>
                  <article className="verify-card">
                    <div className="verify-symbol">
                      <ShieldCheck size={36} strokeWidth={1} />
                    </div>
                    <h3>账户安全验证</h3>
                    <p>
                      {verified
                        ? "演示账户已开启安全保护。"
                        : "开启双重验证，为账户多一层保护。"}
                    </p>
                    <Button onClick={() => setVerified(!verified)}>
                      {verified ? (
                        <>
                          <Check size={13} />
                          已开启
                        </>
                      ) : (
                        "开启验证"
                      )}
                    </Button>
                  </article>
                </div>
              </section>
            </div>
          </div>
          <aside className="finance-right">
            <div className="finance-right-top">
              <section className="days-card ref-soft">
                <RoundIcon>
                  <Clock3 size={16} />
                </RoundIcon>
                <h3>13 天</h3>
                <p>109 小时 23 分钟</p>
                <div className="dot-calendar">
                  {Array.from({ length: 30 }, (_, i) => (
                    <i key={i} className={i < 13 ? "filled" : ""} />
                  ))}
                </div>
              </section>
              <section className="year-card ref-soft">
                <RoundIcon>
                  <SlidersHorizontal size={16} />
                </RoundIcon>
                <div className="year-markers">
                  <span>2025</span>
                  <span>2026</span>
                </div>
              </section>
            </div>
            <section className="stocks-card ref-soft">
              <div className="ref-card-heading">
                <RoundIcon>
                  <Share2 size={16} />
                </RoundIcon>
                <strong>
                  <em>$</em>16,073.49
                </strong>
              </div>
              <Sparkline />
              <div className="ref-card-heading">
                <div>
                  <h2>主要持仓</h2>
                  <p>长期投资组合</p>
                </div>
                <span className="ref-pill">+ 9.3%</span>
              </div>
            </section>
            <section className="rating-card ref-soft">
              <div className="ref-card-heading">
                <div className="carousel-dots">
                  <i />
                  <i />
                  <i className="selected" />
                </div>
                <Round label="清除评价" onClick={() => setRating(null)}>
                  <X size={15} />
                </Round>
              </div>
              <p>体验评价</p>
              <h2>
                {rating === null
                  ? "最近的经营管理，还顺利吗？"
                  : "感谢你的反馈。"}
              </h2>
              <div className="mood-buttons">
                {[0, 1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    aria-label={"评价 " + (n + 1) + " 分"}
                    aria-pressed={rating === n}
                    className={rating === n ? "selected" : ""}
                    onClick={() => setRating(n)}
                  >
                    <svg viewBox="0 0 30 30" aria-hidden="true">
                      <path
                        d={
                          [
                            "M7 20 Q15 4 23 20",
                            "M7 17 Q15 10 23 17",
                            "M7 15H23",
                            "M7 12 Q15 22 23 12",
                            "M7 9 Q15 27 23 9",
                          ][n]
                        }
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="sr-only" role="status">
                {rating !== null ? "已记录 " + (rating + 1) + " 分" : ""}
              </span>
            </section>
          </aside>
        </div>
      </div>
      <RefNote name="财务管理参考页" author="Bogdan Falin / QClay" />
      {popup && (
        <Popup title={popup} onClose={() => setPopup(null)}>
          {popup === "新建转账" ? (
            <form
              className="ref-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label>
                收款人
                <Input required type="email" placeholder="name@studio.com" />
              </label>
              <label>
                金额（USD）
                <Input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="100.00"
                />
              </label>
              <Button type="submit">创建演示转账</Button>
              {sent && <p role="status">演示转账已创建，未发生真实扣款。</p>}
            </form>
          ) : popup === "搜索交易" ? (
            <>
              <Input
                aria-label="搜索账单"
                placeholder="收入、支出、费用"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {[
                "总收入 · $23,194.80",
                "总支出 · $8,145.20",
                "月度费用 · $25.00",
              ]
                .filter((t) => t.toLowerCase().includes(search.toLowerCase()))
                .map((t) => (
                  <p key={t}>{t}</p>
                ))}
            </>
          ) : popup === "财务助手" ? (
            <form
              className="ref-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label>
                你想了解什么？
                <Input required placeholder="本周收支情况" />
              </label>
              <Button>查看示例分析</Button>
              {sent && (
                <p role="status">
                  本周收入 $23,194.80，支出 $8,145.20，净收入 $15,049.60。
                </p>
              )}
            </form>
          ) : (
            <div className="ref-dialog-info">
              <p>
                {popup === "收款信息"
                  ? "演示账户 · STUDIO 2719"
                  : popup === "2026 年 10 月"
                    ? "10 月 22 日，星期四 · 设计评审 10:00 / 项目回顾 15:30"
                    : popup === "银行卡限额"
                      ? "当前单笔限额 $5,000 · 月度限额 $20,000"
                      : popup === "现金流明细"
                        ? "本周收入 $23,194.80 − 支出 $8,145.20 = 净收入 $15,049.60。"
                        : popup === "自动扣款"
                          ? "Linear 每月 $25 · 云服务每月 $80"
                          : popup === "工作空间"
                            ? "使用画布上方的参考页导航，切换财务、旅行、团队与设计语言。"
                            : "该面板展示本地工作空间数据，未连接外部服务。"}
              </p>
              <Button variant="outline" onClick={() => setPopup(null)}>
                完成 <Check size={14} />
              </Button>
            </div>
          )}
        </Popup>
      )}
    </>
  );
}
function RoundIcon({ children }: { children: ReactNode }) {
  return <span className="round-icon">{children}</span>;
}

const hrTasks = [
  { label: "入职面谈", date: "9 月 13 日，08:30", icon: Laptop },
  { label: "团队见面会", date: "9 月 13 日，10:30", icon: Zap },
  { label: "项目进展沟通", date: "9 月 13 日，13:00", icon: MessageCircle },
  { label: "讨论第三季度目标", date: "9 月 13 日，14:45", icon: Settings2 },
  { label: "了解人事制度", date: "9 月 13 日，16:30", icon: Link },
];
export function PeopleReference() {
  const [tasks, setTasks] = useState([true, true, false, false, false]);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(155);
  const [expanded, setExpanded] = useState("设备");
  const [month, setMonth] = useState(8);
  const [popup, setPopup] = useState<string | null>(null);
  const [nav, setNav] = useState("概览");
  const [invited, setInvited] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);
  const completed = tasks.filter(Boolean).length;
  const monday = 15 + ((8 - new Date(2024, month, 15).getDay()) % 7);
  const months = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];
  return (
    <>
      <div lang="zh-CN" className="hr-reference reference-canvas">
        <header className="hr-header">
          <a className="hr-brand" href="#people">
            Crextio
            <span className="brand-notch" />
          </a>
          <nav aria-label="团队功能">
            {[
              "概览",
              "成员",
              "招聘",
              "设备",
              "应用",
              "薪酬",
              "日历",
              "评估",
            ].map((n) => (
              <button
                key={n}
                className={nav === n ? "selected" : ""}
                onClick={() => {
                  setNav(n);
                  if (n !== "概览") setPopup(n);
                }}
              >
                {n}
              </button>
            ))}
          </nav>
          <div className="hr-header-actions">
            <button className="ref-pill" onClick={() => setPopup("设置")}>
              <Settings2 size={16} /> 设置
            </button>
            <Round
              label="团队通知"
              className="has-signal"
              onClick={() => setPopup("通知")}
            >
              <Bell size={17} />
            </Round>
            <Round label="用户资料" onClick={() => setPopup("个人资料")}>
              <User size={17} />
            </Round>
          </div>
        </header>
        <h1>欢迎回来，Nixtio</h1>
        <section className="hr-overview">
          <div className="hr-allocation">
            {[
              ["面试", "15%"],
              ["已录用", "15%"],
              ["项目投入", "60%"],
              ["交付", "10%"],
            ].map(([label, value], i) => (
              <div key={label} className={"allocation-" + i}>
                <p>{label}</p>
                <span>{value}</span>
              </div>
            ))}
          </div>
          <div className="hr-kpis">
            {[
              [Users, "78", "团队成员"],
              [UserPlus, invited ? "57" : "56", "招聘进展"],
              [Laptop, "203", "项目"],
            ].map(([Icon, value, label]) => {
              const I = Icon as typeof Users;
              return (
                <div key={String(label)}>
                  <span>
                    <I size={15} />
                    <strong>{String(value)}</strong>
                  </span>
                  <small>{String(label)}</small>
                </div>
              );
            })}
          </div>
        </section>
        <div className="hr-grid">
          <section className="hr-portrait">
            <img
              src="/reference-details/hr-portrait.webp"
              alt="参考稿中的团队成员肖像"
            />
            <div>
              <h2>Lora Piterson</h2>
              <p>用户体验设计师</p>
              <span>$1,200</span>
            </div>
          </section>
          <section className="hr-progress hr-card">
            <div className="ref-card-heading">
              <h2>工作进展</h2>
              <Round
                label="工作进度详情"
                onClick={() => setPopup("工作进展明细")}
              >
                <ArrowUpRight />
              </Round>
            </div>
            <div className="hr-progress-value">
              6.1 <small>小时</small>
              <p>
                专注时长
                <br />
                本周累计
              </p>
            </div>
            <div className="hr-bars">
              {[4, 70, 54, 43, 73, 85, 44].map((h, i) => (
                <div key={i}>
                  <div>
                    {i === 5 && <span>5 小时 23 分</span>}
                    <i
                      style={{ height: h + "%" }}
                      className={i === 5 ? "current" : ""}
                    />
                  </div>
                  <b />
                  <small>{["日", "一", "二", "三", "四", "五", "六"][i]}</small>
                </div>
              ))}
            </div>
          </section>
          <section className="hr-timer hr-card">
            <div className="ref-card-heading">
              <h2>专注计时</h2>
              <Round label="计时器详情" onClick={() => setPopup("专注计时")}>
                <ArrowUpRight />
              </Round>
            </div>
            <div className="timer-dial">
              <svg
                viewBox="0 0 200 200"
                className="dial-ticks"
                aria-hidden="true"
              >
                {Array.from({ length: 43 }, (_, i) => (
                  <line
                    key={i}
                    x1="100"
                    y1="12"
                    x2="100"
                    y2={i % 5 === 0 ? "20" : "17"}
                    stroke="#8f9295"
                    strokeWidth="1"
                    transform={"rotate(" + (i * 6.5 + 115) + " 100 100)"}
                  />
                ))}
              </svg>
              <Ring
                value={65}
                time={
                  String(Math.floor(seconds / 60)).padStart(2, "0") +
                  ":" +
                  String(seconds % 60).padStart(2, "0")
                }
                label="专注时长"
              />
            </div>
            <div className="timer-actions">
              <Round
                label="开始计时"
                pressed={running}
                onClick={() => setRunning(true)}
                className={running ? "selected" : ""}
              >
                <Play size={18} />
              </Round>
              <Round
                label="暂停计时"
                pressed={!running}
                onClick={() => setRunning(false)}
              >
                <Pause size={18} />
              </Round>
              <Round
                label="重置计时"
                onClick={() => {
                  setRunning(false);
                  setSeconds(155);
                }}
                className="timer-reset"
              >
                <Timer size={19} />
              </Round>
            </div>
          </section>
          <section className="hr-onboarding hr-card">
            <div className="ref-card-heading">
              <h2>入职进度</h2>
              <strong>
                {Math.round((completed / 5) * 100)}
                <small>%</small>
              </strong>
            </div>
            <div className="onboarding-allocation">
              <div>
                <small>30%</small>
                <span>任务</span>
              </div>
              <div>
                <small>25%</small>
                <span />
              </div>
              <div>
                <small>0%</small>
                <span />
              </div>
            </div>
            <div className="task-stack">
              <div className="stack-sheet one" />
              <div className="stack-sheet two" />
              <div className="hr-task-card dark-glass">
                <div className="ref-card-heading">
                  <h3>入职任务</h3>
                  <strong>
                    {completed}
                    <span>/5</span>
                  </strong>
                </div>
                {hrTasks.map((task, i) => (
                  <label
                    key={task.label}
                    className={tasks[i] ? "hr-task complete" : "hr-task"}
                  >
                    <span className="task-icon">
                      <task.icon size={18} />
                    </span>
                    <span className="task-title">
                      {task.label}
                      <small>{task.date}</small>
                    </span>
                    <input
                      type="checkbox"
                      aria-label={task.label}
                      checked={tasks[i]}
                      onChange={() =>
                        setTasks(tasks.map((v, j) => (i === j ? !v : v)))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>
          <section className="hr-benefits hr-card">
            {["养老金缴纳", "设备", "薪酬概览", "员工福利"].map((label) => (
              <div key={label}>
                <button
                  aria-expanded={expanded === label}
                  onClick={() => setExpanded(expanded === label ? "" : label)}
                >
                  {label}
                  <ChevronDown
                    size={16}
                    className={expanded === label ? "rotate-180" : ""}
                  />
                </button>
                {expanded === label && (
                  <div className="benefit-detail">
                    {label === "设备" ? (
                      <>
                        <div className="laptop-art">
                          <i />
                        </div>
                        <span>
                          MacBook Air<small>M1 芯片版本</small>
                        </span>
                        <Round
                          label="设备详情"
                          onClick={() => setPopup("MacBook Air")}
                        >
                          <MoreVertical size={16} />
                        </Round>
                      </>
                    ) : (
                      <p>
                        {label === "养老金缴纳"
                          ? "公司缴纳 · 每月 $240"
                          : label === "薪酬概览"
                            ? "基本工资 · 每月 $1,200"
                            : "20 天年假 · 医疗保障"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
          <section className="hr-calendar hr-card">
            <div className="ref-card-heading">
              <button
                className="ref-pill"
                disabled={month === 0}
                onClick={() => setMonth(month - 1)}
              >
                {months[Math.max(0, month - 1)]}
              </button>
              <h2>2024 年 {months[month]}</h2>
              <button
                className="ref-pill"
                disabled={month === 11}
                onClick={() => setMonth(month + 1)}
              >
                {months[Math.min(11, month + 1)]}
              </button>
            </div>
            <div className="calendar-days">
              <span />
              {["周一", "周二", "周三", "周四", "周五", "周六"].map((d, i) => (
                <div key={d}>
                  <span>{d}</span>
                  <strong>{monday + i}</strong>
                </div>
              ))}
            </div>
            <div className="calendar-grid">
              <div className="calendar-times">
                {["08:00", "09:00", "10:00", "11:00"].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="calendar-lines">
                {Array.from({ length: 6 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <button
                className="calendar-event event-one"
                onClick={() => setPopup("团队周会")}
              >
                <span>
                  团队周会<small>同步本周项目进展</small>
                </span>
                <span className="tiny-avatars">
                  <i>AC</i>
                  <i>MW</i>
                  <i>NL</i>
                </span>
              </button>
              <button
                className="calendar-event event-two"
                onClick={() => setPopup("新成员入职介绍")}
              >
                <span>
                  新成员入职介绍<small>认识团队与工作方式</small>
                </span>
                <span className="tiny-avatars">
                  <i>LP</i>
                  <i>JK</i>
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
      <RefNote name="团队管理参考页" author="Bogdan Nikitin / Nixtio" />
      {popup && (
        <Popup
          title={popup}
          onClose={() => {
            setPopup(null);
            setNav("概览");
          }}
        >
          {popup === "招聘" || popup === "成员" ? (
            <form
              className="ref-form"
              onSubmit={(e) => {
                e.preventDefault();
                setInvited(true);
              }}
            >
              <label>
                邀请成员
                <Input required type="email" placeholder="name@studio.com" />
              </label>
              <Button type="submit">添加演示邀请</Button>
              {invited && <p role="status">已添加本地邀请，未发送邮件。</p>}
            </form>
          ) : (
            <div className="ref-dialog-info">
              <p>
                {popup === "工作进展明细"
                  ? "本周平均工作时间 6.1 小时，周五已专注 5 小时 23 分钟。"
                  : popup === "MacBook Air"
                    ? "MacBook Air · Apple M1 · 16 GB · 使用人 Lora Piterson"
                    : popup === "专注计时"
                      ? "使用开始、暂停与重置按钮记录本地专注时间。刷新页面后恢复演示初值。"
                      : popup === "团队周会"
                        ? months[month] +
                          " " +
                          monday +
                          "日，2024 年 · 08:30–09:30 · A 会议室 · Alex、Mia、Noah"
                        : popup === "新成员入职介绍"
                          ? months[month] +
                            " " +
                            (monday + 2) +
                            "日，2024 年 · 10:00–11:00 · B 会议室 · Lora、Jack"
                          : popup === "个人资料"
                            ? "Lora Piterson · 用户体验设计师 · 设计团队"
                            : popup === "薪酬"
                              ? "Lora Piterson · 基本工资 $1,200 · 按月发放"
                              : popup === "通知"
                                ? "2 项入职任务已完成。下一项：项目进展沟通。"
                                : "团队演示工作空间。使用页面上的设备折叠项、日期切换与入职复选框查看交互状态。"}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setPopup(null);
                  setNav("概览");
                }}
              >
                完成
              </Button>
            </div>
          )}
        </Popup>
      )}
    </>
  );
}

export function TravelReference() {
  const [tab, setTab] = useState("总览");
  const [category, setCategory] = useState("全部");
  const [zoom, setZoom] = useState(1);
  const [popup, setPopup] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <>
      <div lang="zh-CN" className="trip-reference reference-canvas">
        <aside className="trip-sidebar">
          <a className="trip-brand" href="#travel">
            <Compass size={24} /> Trip<span>AI</span>
            <i />
          </a>
          <button className="trip-create" onClick={() => setPopup("创建旅程")}>
            <Plus size={17} />
            创建新的旅程
          </button>
          <p className="trip-section-label">我的工作空间</p>
          <button className="trip-nav active" onClick={() => setTab("总览")}>
            <Grid2X2 size={17} />
            总览
          </button>
          <button className="trip-nav" onClick={() => setPopup("已收藏地点")}>
            <MapPin size={17} />
            已收藏地点<span>{saved ? "01" : "00"}</span>
          </button>
          <button className="trip-nav" onClick={() => setPopup("我的旅程")}>
            <Plane size={17} />
            我的旅程
          </button>
          <div className="trip-recent">
            <p className="trip-section-label">最近的旅程</p>
            <button onClick={() => setPopup("圣托里尼行程")}>
              <span className="recent-thumb" />
              圣托里尼，希腊
              <ChevronRight size={12} />
            </button>
            <button onClick={() => setPopup("玻璃之城行程")}>
              <span className="recent-thumb second" />
              玻璃之城
              <ChevronRight size={12} />
            </button>
          </div>
          <section className="trip-assistant">
            <div className="ref-card-heading">
              <span>
                <Sparkles size={15} /> 旅行助手
              </span>
              <button
                aria-label="助手说明"
                onClick={() => setPopup("旅行助手")}
              >
                <Expand size={15} />
              </button>
            </div>
            <div className="assistant-orb" aria-hidden="true" />
            <h2>
              准备好一起探索
              <br />
              <b>心仪的酒店</b> ，还是
              <br />
              规划你的 <b>专属行程？</b>
            </h2>
            <p>一起创造值得回味的旅行记忆。</p>
            <div className="assistant-prompts">
              {["泳池酒店", "安静住宿", "当地美食"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setMessage(t);
                    setResponse(
                      t === "泳池酒店"
                        ? "推荐：卡尔德拉之家 · 私人泳池 · 每晚 $240"
                        : t === "安静住宿"
                          ? "推荐：伊亚小镇 · 远离主街 · 海景套房"
                          : "推荐：费拉市场 · 地中海风味 · 午间开放",
                    );
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setResponse(
                  "为你建议：上午漫步伊亚，午后前往海岸，傍晚在费拉欣赏日落。示例回复，未连接 AI 服务。",
                );
              }}
            >
              <Input
                aria-label="旅行助手问题"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="聊聊你期待的旅程…"
                required
              />
              <button aria-label="发送问题" type="submit">
                <ArrowUpRight size={16} />
              </button>
            </form>
            {response && (
              <p className="assistant-response" role="status">
                {response}
              </p>
            )}
            <div className="assistant-bottom">
              <span>
                <i />
                你的专属旅行伙伴
              </span>
              <Round label="助手功能说明" onClick={() => setPopup("旅行助手")}>
                <HelpCircle size={16} />
              </Round>
            </div>
          </section>
          <div className="trip-profile">
            <span className="ref-user-avatar">LX</span>
            <span>
              Leng Jingxu<small>个人账户</small>
            </span>
            <Settings2 size={16} />
          </div>
        </aside>
        <div className="trip-main">
          <header className="trip-header">
            <div>
              <span>探索</span>
              <ChevronRight size={12} />
              <strong>圣托里尼，希腊</strong>
            </div>
            <div>
              <Round label="旅行偏好" onClick={() => setPopup("旅行偏好")}>
                <SlidersHorizontal size={16} />
              </Round>
              <Round
                label="目的地信息"
                onClick={() => setPopup("关于圣托里尼")}
              >
                <HelpCircle size={16} />
              </Round>
            </div>
          </header>
          <section className="trip-hero">
            <div className="trip-scene">
              <img
                src="/reference-details/santorini-study.webp"
                alt="圣托里尼白色风车，提取自 TripAI 参考静帧"
              />
            </div>
            <div className="trip-hero-shade" />
            <div className="trip-gallery">
              <button
                aria-label="显示目的地主图"
                onClick={() => setPopup("目的地图集")}
                className="active"
              >
                <img
                  src="/reference-details/trip-thumb-0.webp"
                  alt="目的地缩略图"
                />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  aria-label={"目的地图片 " + n}
                  onClick={() => setPopup("目的地图集")}
                >
                  <img
                    src={"/reference-details/trip-thumb-" + n + ".webp"}
                    alt={"目的地缩略图 " + n}
                  />
                </button>
              ))}
              <button onClick={() => setPopup("目的地图集")}>+5</button>
            </div>
            <div className="trip-hero-title">
              <span>希腊 / 南爱琴海</span>
              <h1>圣托里尼</h1>
              <p>
                圣托里尼坐落于希腊爱琴海，
                <br />
                白色建筑、壮丽海景与宁静的天际线，让每一次停留都值得。
              </p>
            </div>
            <div className="trip-hero-bottom">
              <nav aria-label="旅行详情">
                {["总览", "酒店", "行程", "航班"].map((t) => (
                  <button
                    key={t}
                    className={tab === t ? "active" : ""}
                    aria-pressed={tab === t}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </nav>
              <div>
                <Round
                  label="浏览目的地图片"
                  onClick={() => setPopup("目的地图集")}
                >
                  <Image size={15} />
                </Round>
                <Round
                  label="保存目的地"
                  pressed={saved}
                  onClick={() => setSaved(!saved)}
                >
                  {saved ? <Check size={15} /> : <MapPin size={15} />}
                </Round>
              </div>
            </div>
          </section>
          {tab === "总览" ? (
            <>
              <section className="trip-stats">
                <article>
                  <RoundIcon>
                    <Sun size={18} />
                  </RoundIcon>
                  <div className="weather-value">
                    <span className="weather-halo" />
                    28<small>°C</small>
                  </div>
                  <p>出行期间天气</p>
                </article>
                <article>
                  <RoundIcon>
                    <span>$</span>
                  </RoundIcon>
                  <strong className="trip-budget">
                    <small>$</small> 1,581 – <small>$</small> 3,162
                  </strong>
                  <div className="budget-bars">
                    {Array.from({ length: 15 }, (_, i) => (
                      <i key={i} className={i > 3 && i < 11 ? "filled" : ""} />
                    ))}
                  </div>
                  <p>一周旅程预算</p>
                </article>
                <article>
                  <RoundIcon>
                    <Users size={18} />
                  </RoundIcon>
                  <strong>游客较少</strong>
                  <div className="busy-bars">
                    {[20, 30, 44, 62, 56, 46].map((h, i) => (
                      <i
                        key={i}
                        style={{ height: h }}
                        className={i === 3 ? "filled" : ""}
                      >
                        {i === 3 && <span>六月</span>}
                      </i>
                    ))}
                  </div>
                </article>
              </section>
              <section className="trip-map">
                <div
                  className="map-art"
                  style={{ transform: "scale(" + zoom + ")" }}
                >
                  <svg
                    viewBox="0 0 900 340"
                    preserveAspectRatio="xMidYMid slice"
                    aria-label="圣托里尼示意地图，非导航地图"
                    role="img"
                  >
                    <path d="M0 0H900V340H0Z" fill="#e8ebed" />
                    <path
                      d="M420-30 550 8 612 55 620 105 697 159 685 211 774 254 834 340H410L442 288 398 244 431 186 379 151 413 105 373 66Z"
                      fill="#fafbfb"
                      stroke="#e0e3e5"
                    />
                    <path
                      d="M449 18 478 66 458 114 512 157 540 201 512 242 613 282 675 340M478 66 551 48M512 157 651 167M540 201 669 214M512 242 457 282"
                      fill="none"
                      stroke="#dde0e2"
                      strokeWidth="4"
                    />
                    <path
                      d="M451 45 473 88 460 120 511 167 531 214 521 244 612 286"
                      fill="none"
                      stroke="#d31218"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <g fontFamily="sans-serif" fontSize="12" fill="#555b63">
                      <text x="424" y="39">
                        伊亚
                      </text>
                      <text x="438" y="102">
                        伊莫洛维里
                      </text>
                      <text x="478" y="149">
                        费拉
                      </text>
                      <text x="552" y="210">
                        皮尔戈斯
                      </text>
                      <text x="593" y="279">
                        恩波里奥
                      </text>
                      <text x="670" y="244">
                        卡马里
                      </text>
                      <text x="212" y="171" fill="#555b63">
                        爱琴海
                      </text>
                    </g>
                    <g fill="#20262b" stroke="white" strokeWidth="4">
                      <circle cx="473" cy="88" r="11" />
                      <circle cx="531" cy="214" r="11" />
                      <circle cx="612" cy="286" r="11" />
                    </g>
                    <g fill="#d31218">
                      <circle cx="473" cy="88" r="2" />
                      <circle cx="531" cy="214" r="2" />
                      <circle cx="612" cy="286" r="2" />
                    </g>
                  </svg>
                </div>
                <Round
                  label="地图信息"
                  onClick={() => setPopup("地图说明")}
                  className="map-compass"
                >
                  <Compass size={17} />
                </Round>
                <div className="map-category">
                  {[
                    { name: "全部", icon: Grid2X2 },
                    { name: "酒店", icon: Landmark },
                    { name: "餐饮", icon: Utensils },
                    { name: "海滩", icon: Waves },
                  ].map(({ name, icon: I }) => (
                    <button
                      aria-label={name + " 地点"}
                      key={name}
                      className={category === name ? "selected" : ""}
                      aria-pressed={category === name}
                      onClick={() => setCategory(name)}
                    >
                      <I size={17} />
                    </button>
                  ))}
                </div>
                <div className="map-controls">
                  <Round
                    label="放大地图"
                    onClick={() => setZoom(Math.min(1.6, zoom + 0.2))}
                  >
                    <Plus size={18} />
                  </Round>
                  <Round
                    label="缩小地图"
                    onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                  >
                    <span>−</span>
                  </Round>
                </div>
                <button
                  className="map-place"
                  onClick={() =>
                    setPopup(
                      category === "酒店"
                        ? "卡尔德拉之家"
                        : category === "餐饮"
                          ? "费拉市场"
                          : category === "海滩"
                            ? "红沙滩"
                            : "古锡拉遗址",
                    )
                  }
                >
                  <span className="place-thumb" />
                  <span>
                    {category === "酒店"
                      ? "卡尔德拉之家"
                      : category === "餐饮"
                        ? "费拉市场"
                        : category === "海滩"
                          ? "红沙滩"
                          : "古锡拉遗址"}
                    <small>
                      <i />
                      <i />
                      <i />
                      <i />
                      <i /> 4.9
                    </small>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
                <span className="map-disclaimer">
                  概念示意地图 · 不可用于导航
                </span>
              </section>
            </>
          ) : (
            <section className="trip-tab-content">
              <h2>
                {tab === "酒店"
                  ? "住进一段特别的风景。"
                  : tab === "行程"
                    ? "为探索，留一点时间。"
                    : "你的旅程，从这里出发。"}
              </h2>
              {(tab === "酒店"
                ? [
                    "卡尔德拉之家 · 海景房 · 每晚 $240",
                    "伊亚白色套房 · 私人泳池 · 每晚 $310",
                    "中庭旅居 · 费拉中心 · 每晚 $180",
                  ]
                : tab === "行程"
                  ? [
                      "第 1 天 · 抵达入住，沿着海岸漫步",
                      "第 2 天 · 伊亚小镇与宁静的日落",
                      "第 3 天 · 古锡拉遗址与爱琴海",
                    ]
                  : [
                      "雅典 → 圣托里尼 · 08:30–09:20 · $129",
                      "雅典 → 圣托里尼 · 12:45–13:35 · $149",
                      "雅典 → 圣托里尼 · 17:00–17:50 · $119",
                    ]
              ).map((t) => (
                <button key={t} onClick={() => setPopup(t)}>
                  <span>{t}</span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
              <p>概念旅行数据，未连接真实预订服务。</p>
            </section>
          )}
        </div>
      </div>
      <RefNote name="TripAI 旅行参考页" author="RonDesignLab" />
      {popup && (
        <Popup title={popup} onClose={() => setPopup(null)}>
          <div className="ref-dialog-info">
            <p>
              {popup === "已收藏地点"
                ? saved
                  ? "圣托里尼，希腊 · 已保存到当前会话"
                  : "还没有保存的地点。点击主视觉右下角的地点按钮添加。"
                : popup === "地图说明"
                  ? "此地图为手绘概念示意，仅展示布局与路线风格，不可用于导航。"
                  : popup === "旅行助手"
                    ? "此助手提供本地示例回复。输入问题或选择快捷话题，体验对话布局。未连接语音或模型服务。"
                    : popup === "目的地图集"
                      ? "主视觉由 TripAI 静帧中的风车场景提取并灰度转译。原稿位于 design/references/tripai.png；仅作设计研究。"
                      : "圣托里尼 · 希腊 · 7 天 · 2 位旅客。这是旅行参考页面，不提供真实预订。"}
            </p>
            <Button variant="outline" onClick={() => setPopup(null)}>
              完成
            </Button>
          </div>
        </Popup>
      )}
    </>
  );
}
