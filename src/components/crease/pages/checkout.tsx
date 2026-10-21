import { useState } from "react";
import { Button, Card, Field, PageHeader } from "@/components/crease/ui";

export function CheckoutPage() {
  const [done, setDone] = useState(false);
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_18rem] lg:px-6">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          setDone(true);
        }}
      >
        <PageHeader kicker="Checkout" title="结算" body="地址和付款分开。确认是黑按钮，金额不涂红。" />
        <Card className="flex flex-col gap-4">
          <Field label="收件人" defaultValue="镜" />
          <Field label="地址" defaultValue="上海" />
        </Card>
        <Card>
          <p className="text-sm font-medium">付款</p>
          <div className="mt-3 flex gap-2">
            <Button>卡片</Button>
            <Button variant="quiet">稍后</Button>
          </div>
        </Card>
        <Button type="submit">{done ? "已记下" : "确认订单"}</Button>
      </form>
      <Card>
        <p className="type-kicker">袋子</p>
        <p className="mt-3 font-medium">白亚克力灯 · 中</p>
        <p className="type-note mt-1">1 件</p>
        <p className="mt-6 font-display text-4xl">¥ 280</p>
      </Card>
    </div>
  );
}
