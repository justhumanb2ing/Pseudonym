import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Logo from "./logo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useParams, useLocation } from "react-router";
import { getLocalizedPath } from "@/utils/localized-path";
import UserDropdown from "../auth/user-dropdown";
import { ChartColumnIcon, LayoutDashboardIcon, SettingsIcon, ChevronRightIcon } from "lucide-react";

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { lang, handle } = useParams();
  const location = useLocation();

  const data = {
    main: [
      {
        title: "My Layout",
        icon: LayoutDashboardIcon,
        isActive: true,
        items: [
          {
            title: "Links",
            url: getLocalizedPath(lang, `/studio/${handle}/links`),
          },
          {
            title: "Design",
            url: getLocalizedPath(lang, `/studio/${handle}/design`),
          },
        ],
      },
    ],
    aside: [
      {
        title: "Insights",
        url: getLocalizedPath(lang, `/studio/${handle}/insights`),
        icon: ChartColumnIcon,
      },
      {
        title: "Settings",
        url: getLocalizedPath(lang, `/studio/${handle}/settings`),
        icon: SettingsIcon,
      },
    ],
  };

  return (
    <Sidebar
      collapsible="icon"
      className="group-data-[side=left]:border-r-0"
      {...props}
    >
      <SidebarHeader className="flex justify-center">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="gap-1 group-data-[collapsible=icon]:gap-2 p-2 group-data-[collapsible=icon]:items-center">
        <SidebarGroup className="p-0">
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            {data.main.map((item) => (
              <Collapsible
                key={item.title}
                defaultOpen={item.isActive}
                className={"group/collapsible"}
                render={
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={item.title}
                          className="group-data-[collapsible=icon]:[&_svg]:size-6 group-data-[collapsible=icon]:justify-center"
                        >
                          {item.icon && <item.icon fill="#00000020"/>}
                          <span className="group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                      }
                    ></CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={location.pathname === subItem.url}
                              render={
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              }
                            ></SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                }
              ></Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:items-center">
            {data.aside.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={location.pathname === item.url}
                  className="group-data-[collapsible=icon]:[&_svg]:size-6 group-data-[collapsible=icon]:justify-center"
                  render={
                    <a href={item.url}>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </a>
                  }
                ></SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:items-center">
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
