import { useState } from "react";
import { Cat } from "@/components/crease/cat";
import { Button, Card, DataRow, Empty, Field, FigureCard, PageHeader, Stat } from "@/components/crease/ui";

const ORDERS = [
  { id: "1042", name: "白亚克力灯", status: "在路上", amount: "¥ 280", when: "今天 09:12" },
  { id: "1041", name: "黑亚克力托盘", status: "待付", amount: "¥ 160", when: "昨天" },
  { id: "1038", name: "细线便签", status: "完成", amount: "¥ 42", when: "周二" },
];

export function AdminPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:px-6">
      <PageHeader kicker="Admin" title="今天" body="管理首页只放要处理的数字和最近的单。红点表示还在路上。" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="今日订单" value="18" hint="比昨天多 3" />
        <Stat label="待处理" value="4" hint="其中 1 单在路上" />
        <Stat label="已完成" value="12" />
      </div>
      <Card className="overflow-hidden p-0">
        {ORDERS.map((order) => (
          <DataRow
            key={order.id}
            title={`${order.id} · ${order.name}`}
            meta={order.when}
            aside={order.status === "在路上" ? "● 在路上" : order.status}
          />
        ))}
      </Card>
    </div>
  );
}

export function OrdersPage() {
  const [status, setStatus] = useState("全部");
  const [picked, setPicked] = useState(ORDERS[0].id);
  const statuses = ["全部", "待付", "在路上", "完成"];
  const visible = ORDERS.filter((order) => status === "全部" || order.status === status);
  const current = visible.find((order) => order.id === picked) ?? visible[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:px-6">
      <PageHeader kicker="Orders" title="订单" body="筛选在上，列表在左。选中只留一条红线。" />
      <div className="flex flex-wrap gap-2">
        {statuses.map((item) => (
          <Button key={item} variant={status === item ? "primary" : "quiet"} onClick={() => setStatus(item)}>
            {item}
          </Button>
        ))}
      </div>
      {visible.length === 0 ? (
        <Empty title="没有这种状态" body="换一个筛选。" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <Card className="overflow-hidden p-0">
            {visible.map((order) => (
              <DataRow
                key={order.id}
                title={order.name}
                meta={`${order.id} · ${order.when}`}
                aside={order.amount}
                active={current?.id === order.id}
                onClick={() => setPicked(order.id)}
              />
            ))}
          </Card>
          {current && (
            <Card>
              <p className="type-kicker">{current.status}</p>
              <h2 className="mt-2 text-lg font-medium">{current.name}</h2>
              <p className="mt-4 font-display text-4xl">{current.amount}</p>
              <p className="type-note mt-2">{current.when}</p>
              <Button className="mt-6 w-full">标记处理</Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export function UserPage() {
  const [name, setName] = useState("镜");
  const [saved, setSaved] = useState(false);
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10 lg:grid-cols-[12rem_1fr] lg:px-6">
      <Card className="flex flex-col items-center py-6 text-center">
        <Cat mood={saved ? "happy" : "idle"} className="size-20" />
        <p className="mt-3 font-medium">{name || "未命名"}</p>
        <p className="type-note">上海</p>
      </Card>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <PageHeader kicker="Account" title="用户" body="资料停在白卡上。保存之后猫会笑一下。" />
        <Card className="flex flex-col gap-4">
          <Field label="名字" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} />
          <Field label="邮箱" defaultValue="you@example.com" />
        </Card>
        <div className="flex gap-3">
          <Button type="submit">保存资料</Button>
          {saved && <p className="type-note self-center">已记下。</p>}
        </div>
      </form>
    </div>
  );
}

export function LoginPage() {
  const [mail, setMail] = useState("");
  const [sent, setSent] = useState(false);
  const invalid = sent && !mail.trim();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-4 py-16">
      <div className="flex flex-col items-center text-center">
        <Cat mood={mail ? "look" : "idle"} className="size-16" />
        <h1 className="title-cut mt-4 font-display text-4xl">进入</h1>
        <p className="type-note mt-3">登录页保持浅底。按钮是黑的。</p>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <Field
          label="邮箱"
          type="email"
          value={mail}
          placeholder="you@example.com"
          invalid={invalid}
          hint={invalid ? "还没写邮箱。红只在底边。" : undefined}
          onChange={(event) => {
            setMail(event.target.value);
            setSent(false);
          }}
        />
        <Field label="密码" type="password" placeholder="至少 8 位" />
        <Button type="submit" className="w-full">继续</Button>
      </form>
    </div>
  );
}

export function MobileOrdersPage() {
  const [open, setOpen] = useState<string | null>(ORDERS[0].id);
  return (
    <div className="mx-auto w-full max-w-[420px] px-4 py-8">
      <div className="overflow-hidden rounded-lg border border-line bg-paper shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-medium">订单</p>
          <span className="type-note">{ORDERS.length}</span>
        </div>
        {ORDERS.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => setOpen(open === order.id ? null : order.id)}
            className="block w-full border-b border-line px-4 py-4 text-left last:border-b-0"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-medium">{order.name}</span>
              <span className="text-sm">{order.amount}</span>
            </span>
            <span className="type-note mt-1 block">{order.status} · {order.when}</span>
            {open === order.id && (
              <span className="mt-3 block border-t border-line pt-3 text-sm">
                单号 {order.id}。点按展开，不跳去另一页。
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductPage() {
  const [size, setSize] = useState("中");
  const [added, setAdded] = useState(false);
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-2 lg:px-6">
      <FigureCard kicker="商品" title="白亚克力灯" body="图在左，购买在右。" plate="field" />
      <div>
        <p className="type-kicker">Product</p>
        <h1 className="title-cut mt-3 font-display text-5xl leading-tight">白亚克力灯</h1>
        <p className="mt-4 font-display text-4xl">¥ 280</p>
        <p className="type-note mt-3">半透的罩，顶上有一层薄光。红不进价格，也不进按钮。</p>
        <p className="mt-6 text-sm font-medium">尺寸</p>
        <div className="mt-2 flex gap-2">
          {["小", "中", "大"].map((item) => (
            <Button key={item} variant={size === item ? "primary" : "quiet"} onClick={() => setSize(item)}>
              {item}
            </Button>
          ))}
        </div>
        <Button className="mt-8" onClick={() => setAdded(true)}>
          {added ? "已放入" : "放入袋子"}
        </Button>
      </div>
    </div>
  );
}

const SOURCES = [
  {
    title: "Mirror's Edge",
    year: "2008",
    who: "DICE，发行 Electronic Arts。美术指导 Johannes Söderqvist。",
    take: "白的环境，红只用来标路。CREASE 把这条收成细线，不做成按钮，也不做成大色块。",
    href: "https://www.ign.com/articles/2008/11/13/artist-in-residence-mirrors-edge",
    hrefLabel: "IGN：Artist in Residence，Söderqvist 谈红与白",
  },
  {
    title: "Mirror's Edge Catalyst",
    year: "2016",
    who: "DICE / EA。美术指导 Jhony Ljungstedt。",
    take: "城市被收成干净的白色体块。我们取的是这种克制，不是游戏画面本身。",
    href: "https://80.lv/articles/ea-dices-artists-talk-building-the-world-of-mirrors-edge-catalyst",
    hrefLabel: "80 Level：DICE 谈 Glass 城的干净外观",
  },
];

export function SourcesPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 lg:px-6">
      <PageHeader
        kicker="Sources"
        title="灵感，不是素材"
        body="镜之边缘只作为视觉方法的出处。仓库里的标志和分享图是原创，没有使用游戏截图、角色或标志。"
      />
      {SOURCES.map((source) => (
        <Card key={source.title}>
          <p className="type-kicker">{source.year}</p>
          <h2 className="mt-2 font-display text-3xl">{source.title}</h2>
          <p className="type-note mt-2">{source.who}</p>
          <p className="type-body mt-4">{source.take}</p>
          <a className="mt-4 inline-block text-sm font-medium underline" href={source.href}>
            {source.hrefLabel}
          </a>
        </Card>
      ))}
    </div>
  );
}
