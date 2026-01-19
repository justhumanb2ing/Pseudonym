import { ChartColumnIcon, ChevronRightIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react";
import { useLocation, useParams } from "react-router";
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
	useSidebar,
} from "@/components/ui/sidebar";
import { getLocalizedPath } from "@/utils/localized-path";
import UserDropdown from "../auth/user-dropdown";
import PageVisibilityToggle from "../page/page-visibility-toggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import Logo from "./logo";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	pageId: string;
	isPublic: boolean;
};

export default function AppSidebar({ pageId, isPublic, ...props }: AppSidebarProps) {
	const { lang, handle } = useParams();
	const location = useLocation();
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

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
		<Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0" {...props}>
			<SidebarHeader className="flex justify-center group-data-[collapsible=icon]:items-center">
				<Logo />
				<div className="group-data-[collapsible=icon]:items-center">
					<UserDropdown />
				</div>
			</SidebarHeader>
			<SidebarContent className="gap-1 p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
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
													className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&_svg]:size-6"
												>
													{item.icon && <item.icon fill="#00000020" />}
													<span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
													<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-open/collapsible:rotate-90" />
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
					<SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
						{data.aside.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									isActive={location.pathname === item.url}
									className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&_svg]:size-6"
									render={
										<a href={item.url}>
											<item.icon />
											<span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
										</a>
									}
								></SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>{isCollapsed ? null : <PageVisibilityToggle pageId={pageId} isPublic={isPublic} />}</SidebarFooter>
		</Sidebar>
	);
}
