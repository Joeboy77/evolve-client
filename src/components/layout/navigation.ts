import {
  BookOpen,
  CalendarClock,
  CalendarRange,
  FolderGit2,
  GraduationCap,
  LayoutGrid,
  Layers,
  MessagesSquare,
  Activity,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/api/types";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  heading: string;
  items: NavigationItem[];
}

const studentNavigation: NavigationSection[] = [
  {
    heading: "Learn",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { label: "My cohort", href: "/cohort", icon: GraduationCap },
      { label: "Curriculum", href: "/curriculum", icon: BookOpen },
      { label: "Timeline", href: "/timeline", icon: CalendarRange },
      { label: "Projects", href: "/projects", icon: FolderGit2 },
    ],
  },
  {
    heading: "Connect",
    items: [
      { label: "Chat", href: "/chat", icon: MessagesSquare },
      { label: "Meetings", href: "/meetings", icon: CalendarClock },
    ],
  },
];

const adminNavigation: NavigationSection[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutGrid }],
  },
  {
    heading: "Manage",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Cohorts", href: "/admin/cohorts", icon: GraduationCap },
      { label: "Curriculum", href: "/admin/curriculum", icon: Layers },
      { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
      { label: "Commit activity", href: "/admin/github", icon: Activity },
    ],
  },
  {
    heading: "Connect",
    items: [
      { label: "Chat", href: "/admin/chat", icon: MessagesSquare },
      { label: "Meetings", href: "/admin/meetings", icon: CalendarClock },
    ],
  },
];

const mentorNavigation: NavigationSection[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutGrid }],
  },
  {
    heading: "My students",
    items: [
      { label: "Students", href: "/admin/users", icon: Users },
      { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
      { label: "Commit activity", href: "/admin/github", icon: Activity },
    ],
  },
  {
    heading: "Connect",
    items: [
      { label: "Chat", href: "/admin/chat", icon: MessagesSquare },
      { label: "Meetings", href: "/admin/meetings", icon: CalendarClock },
    ],
  },
];

export function navigationFor(role: Role): NavigationSection[] {
  if (role === "STUDENT") {
    return studentNavigation;
  }
  return role === "MENTOR" ? mentorNavigation : adminNavigation;
}
