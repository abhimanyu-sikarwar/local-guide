"use client";

import { useTranslatorStore } from "@/store/translatorStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const { speakerGender, setSpeakerGender } = useTranslatorStore();

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-md mx-auto pb-24">
      <h1 className="text-xl font-bold mb-6">Settings</h1>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 rounded-xl border">
          <div>
            <p className="font-medium text-sm">Speaker Voice</p>
            <p className="text-xs text-muted-foreground">Affects translated audio</p>
          </div>
          <Select value={speakerGender} onValueChange={(v) => setSpeakerGender(v as "male" | "female")}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 rounded-xl border">
          <p className="font-medium text-sm mb-1">About</p>
          <p className="text-xs text-muted-foreground">BhashaSethu v1.0</p>
          <p className="text-xs text-muted-foreground">Powered by Sarvam AI — saaras:v3 · mayura:v1 · bulbul:v3</p>
        </div>

        <div className="p-4 rounded-xl border">
          <p className="font-medium text-sm mb-1">Languages</p>
          <p className="text-xs text-muted-foreground">Hindi (hi-IN) ↔ Kannada (kn-IN)</p>
          <p className="text-xs text-muted-foreground mt-0.5">Auto language detection enabled</p>
        </div>
      </div>
    </main>
  );
}
