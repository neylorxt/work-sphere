"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  UserRound,
  Building2,
  Bell,
  ShieldCheck,
  Palette,
  SlidersHorizontal,
  Save,
  RotateCcw,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { resetData } = useStore();
  const { theme, setTheme } = useTheme();
  const [resetOpen, setResetOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Gérez votre profil, votre organisation et vos préférences."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ProfileSection />
        <OrganizationSection />
        <NotificationsSection />
        <SecuritySection />
        <AppearanceSection theme={theme} setTheme={setTheme} />
        <PreferencesSection />
      </div>

      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">Réinitialiser les données de démonstration</h3>
            <p className="text-sm text-muted-foreground">
              Restaure les données fictives d&apos;origine. Toutes les modifications locales seront perdues.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-4" />
            Réinitialiser
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser les données ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes vos modifications (employés ajoutés, congés, documents…) seront supprimées et
              les données de démonstration restaurées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetData();
                setResetOpen(false);
                toast.success("Données réinitialisées", {
                  description: "Les données de démonstration ont été restaurées.",
                });
              }}
            >
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SaveBar({ onSave }: { onSave?: () => void }) {
  return (
    <div className="flex items-center justify-end pt-2">
      <Button
        onClick={() => {
          onSave?.();
          toast.success("Modifications enregistrées");
        }}
      >
        <Save className="size-4" />
        Enregistrer
      </Button>
    </div>
  );
}

function ProfileSection() {
  return (
    <SectionCard
      icon={UserRound}
      title="Profil administrateur"
      description="Informations personnelles du compte administrateur."
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name="Alex Dupont" firstName="Alex" lastName="Dupont" size="lg" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Alex Dupont</p>
            <p className="text-xs text-muted-foreground">Administrateur · admin@worksphere.fr</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-first">Prénom</Label>
            <Input id="p-first" defaultValue="Alex" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-last">Nom</Label>
            <Input id="p-last" defaultValue="Dupont" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-email">Email</Label>
            <Input id="p-email" type="email" defaultValue="admin@worksphere.fr" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-phone">Téléphone</Label>
            <Input id="p-phone" type="tel" defaultValue="+33 6 12 34 56 78" />
          </div>
        </div>
        <SaveBar />
      </div>
    </SectionCard>
  );
}

function OrganizationSection() {
  return (
    <SectionCard
      icon={Building2}
      title="Organisation"
      description="Informations générales de votre entreprise."
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="o-name">Nom de l&apos;entreprise</Label>
            <Input id="o-name" defaultValue="WorkSphere SAS" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-size">Taille de l&apos;équipe</Label>
            <Select id="o-size" defaultValue="50-250">
              <option value="1-10">1-10</option>
              <option value="10-50">10-50</option>
              <option value="50-250">50-250</option>
              <option value="250+">250+</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-domain">Domaine email</Label>
            <Input id="o-domain" defaultValue="worksphere.fr" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-currency">Devise</Label>
            <Select id="o-currency" defaultValue="EUR">
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF (Fr)</option>
            </Select>
          </div>
        </div>
        <SaveBar />
      </div>
    </SectionCard>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = React.useState({
    email: true,
    push: true,
    weeklyDigest: false,
    leaveAlerts: true,
    documentAlerts: true,
  });
  return (
    <SectionCard
      icon={Bell}
      title="Notifications"
      description="Choisissez quelles notifications vous souhaitez recevoir."
    >
      <div className="space-y-4">
        <ToggleRow
          label="Notifications par email"
          description="Recevoir un email pour chaque événement important."
          checked={prefs.email}
          onChange={(v) => setPrefs((p) => ({ ...p, email: v }))}
        />
        <ToggleRow
          label="Notifications push"
          description="Recevoir une alerte en temps réel sur votre navigateur."
          checked={prefs.push}
          onChange={(v) => setPrefs((p) => ({ ...p, push: v }))}
        />
        <ToggleRow
          label="Résumé hebdomadaire"
          description="Un récapitulatif de l'activité chaque lundi matin."
          checked={prefs.weeklyDigest}
          onChange={(v) => setPrefs((p) => ({ ...p, weeklyDigest: v }))}
        />
        <ToggleRow
          label="Alertes de congés"
          description="Notification à chaque demande de congé soumise ou traitée."
          checked={prefs.leaveAlerts}
          onChange={(v) => setPrefs((p) => ({ ...p, leaveAlerts: v }))}
        />
        <ToggleRow
          label="Alertes documents"
          description="Notification quand un document est ajouté ou expire."
          checked={prefs.documentAlerts}
          onChange={(v) => setPrefs((p) => ({ ...p, documentAlerts: v }))}
        />
        <SaveBar />
      </div>
    </SectionCard>
  );
}

function SecuritySection() {
  const [twoFactor, setTwoFactor] = React.useState(true);
  return (
    <SectionCard
      icon={ShieldCheck}
      title="Sécurité"
      description="Protégez l'accès à votre compte administrateur."
      action={<Badge variant="success"><Check className="size-3" /> Sécurisé</Badge>}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-password">Mot de passe actuel</Label>
            <Input id="s-password" type="password" defaultValue="password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-new">Nouveau mot de passe</Label>
            <Input id="s-new" type="password" placeholder="••••••••" />
          </div>
        </div>
        <ToggleRow
          label="Authentification à deux facteurs (2FA)"
          description="Une vérification supplémentaire est requise lors de la connexion."
          checked={twoFactor}
          onChange={setTwoFactor}
        />
        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Dernière connexion : 18 août 2026, 09:14 depuis Paris, FR — Chrome sur Windows.
        </div>
        <SaveBar />
      </div>
    </SectionCard>
  );
}

function AppearanceSection({
  theme,
  setTheme,
}: {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}) {
  return (
    <SectionCard
      icon={Palette}
      title="Apparence"
      description="Personnalisez l'apparence de l'application."
    >
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Thème</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                theme === "light" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
              )}
              aria-pressed={theme === "light"}
            >
              <span className="flex h-16 w-full items-center justify-center rounded-md border bg-background shadow-sm">
                <Sun className="size-6 text-amber-500" />
              </span>
              <span className="text-sm font-medium">Clair</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                theme === "dark" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
              )}
              aria-pressed={theme === "dark"}
            >
              <span className="flex h-16 w-full items-center justify-center rounded-md border bg-zinc-950 shadow-sm">
                <Moon className="size-6 text-indigo-300" />
              </span>
              <span className="text-sm font-medium">Sombre</span>
            </button>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="a-radius">Arrondi des cartes</Label>
            <Select id="a-radius" defaultValue="12px">
              <option value="8px">Faible</option>
              <option value="12px">Modéré</option>
              <option value="16px">Élevé</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-font">Taille de police</Label>
            <Select id="a-font" defaultValue="16px">
              <option value="14px">Compacte</option>
              <option value="16px">Normale</option>
              <option value="18px">Large</option>
            </Select>
          </div>
        </div>
        <SaveBar />
      </div>
    </SectionCard>
  );
}

function PreferencesSection() {
  return (
    <SectionCard
      icon={SlidersHorizontal}
      title="Préférences"
      description="Langue, fuseau horaire et format des données."
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="r-lang">Langue</Label>
            <Select id="r-lang" defaultValue="fr">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-tz">Fuseau horaire</Label>
            <Select id="r-tz" defaultValue="Europe/Paris">
              <option value="Europe/Paris">Paris (GMT+1)</option>
              <option value="Europe/London">Londres (GMT+0)</option>
              <option value="Europe/Berlin">Berlin (GMT+1)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-format">Format de date</Label>
            <Select id="r-format" defaultValue="dd/mm/yyyy">
              <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
              <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
              <option value="yyyy-mm-dd">AAAA-MM-JJ</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-week">Début de semaine</Label>
            <Select id="r-week" defaultValue="monday">
              <option value="monday">Lundi</option>
              <option value="sunday">Dimanche</option>
            </Select>
          </div>
        </div>
        <SaveBar />
      </div>
    </SectionCard>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}