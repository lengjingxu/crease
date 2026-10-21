import { useState } from "react";
import { Card, PageHeader, Switch } from "@/components/crease/ui";

export function SettingsPage() {
  const [mail, setMail] = useState(true);
  const [dark, setDark] = useState(false);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 lg:px-6">
      <PageHeader kicker="Settings" title="设置" body="开关是黑的。关掉时回到灰。页面默认仍是白底。" />
      <Card className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">订单邮件</p>
          <p className="type-note">发出去才通知。</p>
        </div>
        <Switch label="订单邮件" on={mail} onToggle={() => setMail((value) => !value)} />
      </Card>
      <Card className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">深色</p>
          <p className="type-note">这里只记下选择，不把整页涂黑。</p>
        </div>
        <Switch label="深色" on={dark} onToggle={() => setDark((value) => !value)} />
      </Card>
    </div>
  );
}
