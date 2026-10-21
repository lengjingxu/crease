import { useState } from "react";
import { Button, Card, DataRow, Empty, PageHeader } from "@/components/crease/ui";

const NOTES = [
  { id: "n1", title: "1042 已发出", meta: "今天 09:12", unread: true },
  { id: "n2", title: "资料已保存", meta: "昨天", unread: false },
];

export function InboxPage() {
  const [items, setItems] = useState(NOTES);
  const unread = items.filter((item) => item.unread);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 lg:px-6">
      <PageHeader kicker="Inbox" title="通知" body="未读用一个红点，不铺红底。读过之后点消失。" />
      {items.length === 0 ? (
        <Empty title="没有通知" body="空的时候只留这一句。" />
      ) : (
        <Card className="overflow-hidden p-0">
          {items.map((item) => (
            <DataRow
              key={item.id}
              title={item.title}
              meta={item.meta}
              aside={item.unread ? "●" : undefined}
              onClick={() =>
                setItems((list) => list.map((row) => (row.id === item.id ? { ...row, unread: false } : row)))
              }
            />
          ))}
        </Card>
      )}
      {unread.length > 0 && (
        <Button variant="quiet" onClick={() => setItems((list) => list.map((row) => ({ ...row, unread: false })))}>
          全部标为已读
        </Button>
      )}
    </div>
  );
}
