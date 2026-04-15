"use client";

import { useState } from "react";
import { LogOut, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";

type TopBarProps = {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  onSignOut: () => void | Promise<void>;
};

function deriveDisplayName(name: string, email: string): string {
  if (name.trim()) return name;
  const local = email.split("@")[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function TopBar({ userName, userEmail, userImage, onSignOut }: TopBarProps) {
  const displayName = deriveDisplayName(userName, userEmail);
  const initial = displayName.charAt(0).toUpperCase();
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />

      <div className="mx-auto w-full max-w-xl" />
      {/* Barra de busca oculta — reativar quando a funcionalidade estiver pronta.
      <div className="relative mx-auto w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar"
          className="h-9 w-full rounded-full pl-9"
        />
      </div>
      */}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-md p-1"
              aria-label="Abrir menu do usuário"
            />
          }
        >
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {displayName}
          </span>
          <Avatar className="h-8 w-8">
            {userImage ? <AvatarImage src={userImage} alt={displayName} /> : null}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-popover-foreground">
                {displayName}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {userEmail}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setPrefsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Preferências
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={onSignOut}>
            <DropdownMenuItem
              variant="destructive"
              nativeButton
              render={<button type="submit" className="w-full" />}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={prefsOpen} onOpenChange={setPrefsOpen}>
        <PreferenciasDrawer
          displayName={displayName}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          initial={initial}
          onClose={() => setPrefsOpen(false)}
        />
      </Sheet>
    </header>
  );
}

function PreferenciasDrawer({
  displayName,
  userName,
  userEmail,
  userImage,
  initial,
  onClose,
}: {
  displayName: string;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  initial: string;
  onClose: () => void;
}) {
  return (
    <SheetContent side="right">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {userImage ? <AvatarImage src={userImage} alt={displayName} /> : null}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div>
            <SheetTitle>{displayName}</SheetTitle>
            <SheetDescription>{userEmail}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <form
        className="flex flex-col gap-5 overflow-y-auto px-4"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dados
          </h3>
          <div className="grid gap-2">
            <Label htmlFor="pref-nome">Nome</Label>
            <Input id="pref-nome" name="nome" defaultValue={userName} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pref-email">Email</Label>
            <Input
              id="pref-email"
              name="email"
              type="email"
              defaultValue={userEmail}
              readOnly
              className="cursor-not-allowed opacity-70"
            />
            <p className="text-xs text-muted-foreground">
              Email é sua identidade na plataforma. Para alterar, entre em contato com o suporte.
            </p>
          </div>
        </section>

        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Alterar senha
          </h3>
          <div className="grid gap-2">
            <Label htmlFor="pref-senha-atual">Senha atual</Label>
            <Input
              id="pref-senha-atual"
              name="senhaAtual"
              type="password"
              placeholder="Deixe em branco para manter"
              minLength={8}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pref-senha-nova">Nova senha</Label>
            <Input
              id="pref-senha-nova"
              name="novaSenha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
            />
          </div>
        </section>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}
