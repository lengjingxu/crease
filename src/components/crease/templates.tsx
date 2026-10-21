import { useState } from "react";
import { AdminPage, LoginPage, MobileOrdersPage, OrdersPage, ProductPage, SourcesPage, UserPage } from "@/components/crease/app-pages";
import { CheckoutPage } from "@/components/crease/pages/checkout";
import { InboxPage } from "@/components/crease/pages/inbox";
import { SettingsPage } from "@/components/crease/pages/settings";
import { Button, Card, Empty, Field, FigureCard, PageHeader, TextArea } from "@/components/crease/ui";

const PAGES = [
  { id: "kit", label: "组件" },
  { id: "article", label: "文章" },
  { id: "form", label: "表单" },
  { id: "gallery", label: "图库" },
  { id: "admin", label: "管理" },
  { id: "orders", label: "订单" },
  { id: "user", label: "用户" },
  { id: "login", label: "登录" },
  { id: "phone", label: "手机订单" },
  { id: "product", label: "商品" },
  { id: "checkout", label: "结算" },
  { id: "settings", label: "设置" },
  { id: "inbox", label: "通知" },
  { id: "sources", label: "来源" },
] as const;

type PageId = (typeof PAGES)[number]["id"];

const SHOTS = [
  { id: "01", kind: "页面", tone: "plain", plate: "field", title: "白天的体块", body: "说明跟在图下面。" },
  { id: "02", kind: "组件", tone: "acrylic", plate: "mass", title: "透出一层边", body: "框是半透的。" },
  { id: "03", kind: "系统", tone: "ink", plate: "cut", title: "字托在黑上", body: "" },
  { id: "04", kind: "页面", tone: "plain", plate: "mass", title: "另一块白", body: "同一套图卡。" },
] as const;

export function Templates() {
  const [page, setPage] = useState<PageId>("kit");

  return (
    <div>
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-3 lg:px-6">
          {PAGES.map((item) => (
            <Button
              key={item.id}
              variant={page === item.id ? "primary" : "quiet"}
              className={page === item.id ? undefined : "border-transparent"}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      {page === "kit" && <KitPage />}
      {page === "article" && <ArticlePage />}
      {page === "form" && <FormPage />}
      {page === "gallery" && <GalleryPage />}
      {page === "admin" && <AdminPage />}
      {page === "orders" && <OrdersPage />}
      {page === "user" && <UserPage />}
      {page === "login" && <LoginPage />}
      {page === "phone" && <MobileOrdersPage />}
      {page === "product" && <ProductPage />}
      {page === "checkout" && <CheckoutPage />}
      {page === "settings" && <SettingsPage />}
      {page === "inbox" && <InboxPage />}
      {page === "sources" && <SourcesPage />}
    </div>
  );
}

function KitPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:px-6">
      <PageHeader
        kicker="Components"
        title="拿来就能用"
        body="按钮、输入、卡片、图卡和空状态。页面模板用的是同一套。"
      />
      <div className="flex flex-wrap gap-3">
        <Button>主操作</Button>
        <Button variant="line">次操作</Button>
        <Button variant="quiet">安静</Button>
        <Button disabled>不可用</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Field label="标题" placeholder="给它一个名字" />
        </Card>
        <Empty title="还没有内容" body="空状态只留这一句。" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <FigureCard kicker="平面" title="白天的体块" body="说明在图下。" plate="field" />
        <FigureCard tone="acrylic" kicker="白亚克力" title="透出一层边" body="图本身不发虚。" plate="mass" />
        <FigureCard tone="ink" kicker="黑亚克力" title="字可以压在这里" plate="cut" />
      </div>
    </div>
  );
}

function ArticlePage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 lg:px-6">
      <PageHeader
        kicker="Article"
        title="红只切一条线"
        body="文章页保持浅底。图卡和亚克力只在需要停一下的地方出现。"
      />
      <p className="type-body">
        正文用能读的尺寸。一段里不放图形，也不把红铺开。要强调的句子单独成段，停在白上。
      </p>
      <FigureCard kicker="图" title="白天的体块" body="说明跟在图下面，不压在画面上。" />
      <Card className="acrylic p-5">
        <p className="type-title">光从后面来。</p>
        <p className="type-note mt-3">引用才用白亚克力。它比正文轻，但能被记住。</p>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button>继续下一篇</Button>
        <Button variant="line">回到列表</Button>
      </div>
    </article>
  );
}

function FormPage() {
  const [title, setTitle] = useState("");
  const [sent, setSent] = useState(false);
  const invalid = sent && !title.trim();

  return (
    <form
      className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 lg:px-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <PageHeader kicker="Form" title="新建一条" body="字段分组放在白卡里。提交是黑按钮。" />
      <Card className="flex flex-col gap-4">
        <Field
          label="名字"
          name="title"
          value={title}
          placeholder="还没写"
          invalid={invalid}
          hint={invalid ? "缺一句话。红只在底边。" : undefined}
          onChange={(event) => {
            setTitle(event.target.value);
            setSent(false);
          }}
        />
        <TextArea label="备注" name="note" rows={4} placeholder="可以空着" />
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">保存</Button>
        <Button
          variant="quiet"
          onClick={() => {
            setTitle("");
            setSent(false);
          }}
        >
          清空
        </Button>
      </div>
      {sent && !invalid && <p className="text-sm">已记下。按钮没有变红。</p>}
    </form>
  );
}

function GalleryPage() {
  const [kind, setKind] = useState("全部");
  const kinds = ["全部", "页面", "组件", "系统", "记录"];
  const visible = SHOTS.filter((shot) => kind === "全部" || shot.kind === kind);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:px-6">
      <PageHeader kicker="Gallery" title="图库" body="筛选停在上面。卡片用三种图卡。筛空了只留一句。" />
      <div className="flex flex-wrap gap-2">
        {kinds.map((item) => (
          <Button key={item} variant={kind === item ? "primary" : "quiet"} onClick={() => setKind(item)}>
            {item}
          </Button>
        ))}
      </div>
      {visible.length === 0 ? (
        <Empty title="没有这一类" body="换一个筛选。不放假图。" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((shot) => (
            <FigureCard
              key={shot.id}
              tone={shot.tone}
              plate={shot.plate}
              kicker={shot.kind}
              title={shot.title}
              body={shot.body || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
