// TeacherDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  FileText, 
  BookOpen, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  User,
  BookMarked
} from 'lucide-react';

// Import Teacher type from types file
import { Teacher } from '../../types/index';

// shadcn imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Mock service to get teacher data
import { getTeacherById } from '../../services/teacherService';

// Types and interfaces
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  link: string;
  count?: number;
  isActive: boolean;
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  link: string;
  color: string;
}

interface RecentActivityProps {
  title: string;
  timestamp: string;
  type: 'attendance' | 'note' | 'lessonPlan' | 'student';
}

const TeacherDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Mock recent activities
  const recentActivities: RecentActivityProps[] = [
    { title: 'Marked attendance for Basic 5', timestamp: '9:15 AM Today', type: 'attendance' },
    { title: 'Created new science note', timestamp: 'Yesterday', type: 'note' },
    { title: 'Added new lesson plan for Mathematics', timestamp: '2 days ago', type: 'lessonPlan' },
    { title: 'Updated student records', timestamp: '3 days ago', type: 'student' }
  ];

  // Mock upcoming events
  const upcomingEvents = [
    { title: 'Staff Meeting', date: 'Today, 2:00 PM', subject: 'Weekly Review' },
    { title: 'End of Term Exam', date: 'Next Week', subject: 'All Subjects' }
  ];

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        // Get teacher ID from location state
        const teacherId = location.state?.teacherId;
        
        if (!teacherId) {
          // Redirect to teacher selection if no ID
          navigate('/');
          return;
        }
        
        // Fetch teacher data
        const teacherData = await getTeacherById(teacherId);
        setTeacher(teacherData);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        // Handle error - perhaps redirect or show error message
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [location.state, navigate]);

  const handleLogout = () => {
    // Clear any auth tokens or user state here
    navigate('/');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!teacher) {
    return <ErrorState onRetry={() => navigate('/')} />;
  }

  // Function to get initials from teacher name
  const getInitials = (name: string): string => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r fixed h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">MEC Connect</span>
            <Badge variant="outline" className="bg-background">
              Teacher
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col p-4 gap-1 flex-grow">
          <p className="text-xs text-muted-foreground mb-2">MAIN MENU</p>
          <NavItem 
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            link="/dashboard" 
            isActive={true}
          />
          <NavItem 
            icon={<Users size={18} />}
            label="Manage Students" 
            link="/students"
            isActive={false}
          />
          <NavItem 
            icon={<CalendarCheck size={18} />}
            label="Mark Attendance" 
            link="/attendance"
            isActive={false}
          />
          <NavItem 
            icon={<FileText size={18} />}
            label="Class Notes" 
            link="/notes"
            isActive={false}
          />
          <NavItem 
            icon={<BookOpen size={18} />} 
            label="Lesson Plans" 
            link="/lesson-plans"
            isActive={false}
          />
          
          <Separator className="my-4" />
          
          <p className="text-xs text-muted-foreground mb-2">NOTIFICATIONS</p>
          <NavItem 
            icon={<Bell size={18} />}
            label="Notifications" 
            link="/notifications"
            count={3}
            isActive={false}
          />
        </div>
        
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(teacher.teacherName)}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{teacher.teacherName}</p>
                <p className="text-xs text-muted-foreground truncate">{teacher.className}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut size={18} className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Header and Sheet for mobile menu */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background z-10">
        <div className="flex items-center justify-between p-4 h-full">
          <div className="flex items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">MEC Connect</span>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                      <X size={18} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col p-4 gap-1">
                  <p className="text-xs text-muted-foreground mb-2">MAIN MENU</p>
                  <NavItem 
                    icon={<LayoutDashboard size={18} />}
                    label="Dashboard"
                    link="/dashboard" 
                    isActive={true}
                  />
                  <NavItem 
                    icon={<Users size={18} />}
                    label="Manage Students" 
                    link="/students"
                    isActive={false}
                  />
                  <NavItem 
                    icon={<CalendarCheck size={18} />}
                    label="Mark Attendance" 
                    link="/attendance"
                    isActive={false}
                  />
                  <NavItem 
                    icon={<FileText size={18} />}
                    label="Class Notes" 
                    link="/notes"
                    isActive={false}
                  />
                  <NavItem 
                    icon={<BookOpen size={18} />} 
                    label="Lesson Plans" 
                    link="/lesson-plans"
                    isActive={false}
                  />
                  
                  <Separator className="my-4" />
                  
                  <p className="text-xs text-muted-foreground mb-2">NOTIFICATIONS</p>
                  <NavItem 
                    icon={<Bell size={18} />}
                    label="Notifications" 
                    link="/notifications"
                    count={3}
                    isActive={false}
                  />
                </div>
                
                <div className="mt-auto p-4 border-t">
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut size={18} className="mr-2" />
                    Log Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-lg font-bold">Dashboard</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(teacher.teacherName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{teacher.teacherName}</p>
                <p className="text-xs text-muted-foreground">{teacher.className}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Teacher Welcome Banner */}
          <div className="mt-8">
            <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-background">
                      Welcome back
                    </Badge>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                      Hello, {teacher.teacherName.split(' ')[0]}!
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block text-right">
                      <p className="font-medium">{teacher.className}</p>
                      <p className="text-sm text-muted-foreground">Class Teacher</p>
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(teacher.teacherName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
          
          {/* Dashboard Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              {/* Quick Actions */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <QuickAction 
                    icon={<Users size={24} />}
                    label="Manage Students"
                    description="View and update student information"
                    link="/students"
                    color="bg-blue-500"
                  />
                  <QuickAction 
                    icon={<CalendarCheck size={24} />}
                    label="Mark Attendance"
                    description="Record daily student attendance"
                    link="/attendance"
                    color="bg-green-500"
                  />
                  <QuickAction 
                    icon={<FileText size={24} />}
                    label="Create Notes"
                    description="Create and manage class notes"
                    link="/notes"
                    color="bg-purple-500"
                  />
                  <QuickAction 
                    icon={<BookOpen size={24} />}
                    label="Lesson Plans"
                    description="Create and manage lesson plans"
                    link="/lesson-plans"
                    color="bg-amber-500"
                  />
                </div>
              </section>
              
              {/* Stats and Information */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Students in Class
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">28</span>
                      <span className="text-xs text-muted-foreground">students</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                        2 New
                      </Badge>
                      <span>since last month</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Attendance Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">94%</span>
                      <span className="text-xs text-muted-foreground">average</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Class Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <BookMarked size={16} />
                          <span className="text-sm">Lesson Plans</span>
                        </div>
                        <span className="text-sm font-medium">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          <span className="text-sm">Class Notes</span>
                        </div>
                        <span className="text-sm font-medium">8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
              
              {/* Upcoming Events */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <Card>
                  <CardContent className="p-0">
                    {upcomingEvents.length > 0 ? (
                      <div className="divide-y">
                        {upcomingEvents.map((event, index) => (
                          <div key={index} className="p-4 flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">{event.date}</p>
                            </div>
                            <Badge variant="outline" className="bg-primary/5">
                              {event.subject}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No upcoming events</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 px-4 py-2">
                    <Button variant="link" className="ml-auto text-xs">
                      View Calendar <ChevronRight size={12} className="ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </section>
            </TabsContent>
            
            <TabsContent value="activities" className="space-y-8">
              <section>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>
                      Your latest actions and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex">
                          <div className="mr-4">
                            <div className={`
                              h-10 w-10 rounded-full flex items-center justify-center
                              ${activity.type === 'attendance' ? 'bg-green-100 text-green-600' : 
                                activity.type === 'note' ? 'bg-purple-100 text-purple-600' : 
                                activity.type === 'lessonPlan' ? 'bg-amber-100 text-amber-600' : 
                                'bg-blue-100 text-blue-600'
                              }
                            `}>
                              {activity.type === 'attendance' ? <CalendarCheck size={20} /> :
                               activity.type === 'note' ? <FileText size={20} /> :
                               activity.type === 'lessonPlan' ? <BookOpen size={20} /> :
                               <User size={20} />
                              }
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-4">
                    <Button variant="outline" className="w-full">
                      View All Activities
                    </Button>
                  </CardFooter>
                </Card>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Navigation Item Component
const NavItem: React.FC<NavItemProps> = ({ icon, label, link, count, isActive }) => (
  <Link 
    to={link} 
    className={`
      flex items-center justify-between px-3 py-2 rounded-md text-sm 
      ${isActive ? 
        'bg-primary/10 text-primary font-medium' : 
        'text-muted-foreground hover:bg-muted hover:text-foreground'
      }
      transition-colors
    `}
  >
    <div className="flex items-center gap-3">
      <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
        {icon}
      </span>
      {label}
    </div>
    {count !== undefined && (
      <Badge variant="secondary" className="ml-auto">
        {count}
      </Badge>
    )}
  </Link>
);

// Quick Action Component
const QuickAction: React.FC<QuickActionProps> = ({ icon, label, description, link, color }) => (
  <Link to={link}>
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className={`${color} text-white p-3 rounded-full w-fit mb-4`}>
          {icon}
        </div>
        <h3 className="font-semibold mb-1">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

// Loading State Component
const LoadingState: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading your dashboard...</p>
    </div>
  </div>
);

// Error State Component
const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Unable to load dashboard</CardTitle>
        <CardDescription>
          We couldn't retrieve your teacher profile. This might be due to an expired session or network issue.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onRetry} className="w-full">
          Return to Teacher Selection
        </Button>
      </CardFooter>
    </Card>
  </div>
);

export default TeacherDashboard;








// // src/pages/TeacherDashboard.tsx
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { HomeIcon } from 'lucide-react';

// const TeacherDashboard: React.FC = () => {
//   // Demo data - in a real app, this would come from an API
//   const [upcomingClasses] = useState([
//     { id: 1, subject: 'Mathematics', grade: '10th', time: '09:00 AM', students: 28 },
//     { id: 2, subject: 'Physics', grade: '12th', time: '11:30 AM', students: 22 },
//     { id: 3, subject: 'Chemistry', grade: '11th', time: '02:15 PM', students: 25 },
//   ]);

//   const [recentActivities] = useState([
//     { id: 1, type: 'assignment', title: 'Algebra Quiz', date: 'Today', status: 'Graded' },
//     { id: 2, type: 'attendance', title: 'Physics Class', date: 'Yesterday', status: 'Completed' },
//     { id: 3, type: 'lesson', title: 'Chemistry Lab Introduction', date: '2 days ago', status: 'Published' },
//   ]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-indigo-700 text-white shadow-md">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <span className="text-2xl font-bold">MEC Connect</span>
//               </div>
//               <nav className="hidden md:ml-10 md:flex space-x-8">
//                 <Link to="/dashboard" className="text-white font-medium hover:text-indigo-100">Dashboard</Link>
//                 <Link to="/classes" className="text-indigo-200 font-medium hover:text-white">Classes</Link>
//                 <Link to="/students" className="text-indigo-200 font-medium hover:text-white">Students</Link>
//                 <Link to="/resources" className="text-indigo-200 font-medium hover:text-white">Resources</Link>
//               </nav>
//             </div>
//             <div className="flex items-center">
//               <div className="flex items-center">
//                 <button title="View notifications" className="p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none">
//                   <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                   </svg>
//                 </button>
//                 <div className="ml-3 relative">
//                   <div className="flex items-center">
//                     <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
//                       <span className="text-sm font-medium">JS</span>
//                     </div>
//                     <span className="ml-2 text-sm font-medium">Nii Kotey</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         {/* Welcome Banner */}
//         <div className="px-4 sm:px-0 mb-8">
//           <div className="bg-white rounded-2xl shadow-md overflow-hidden">
//             <div className="md:flex">
//               <div className="md:flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 md:w-48 flex items-center justify-center">
//                 <svg className="h-24 w-24 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                 </svg>
//               </div>
//               <div className="p-8">
//                 <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">Teacher Portal</div>
//                 <h1 className="mt-1 text-3xl font-bold text-gray-800">Welcome back, Dzifa!</h1>
//                 <p className="mt-2 text-gray-600">
//                   Access all your teaching resources, manage student records, create lesson plans, and track assessments from this dashboard.
//                 </p>
//                 <div className="mt-4 flex flex-wrap gap-2">
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
//                     <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
//                       <circle cx="4" cy="4" r="3" />
//                     </svg>
//                     3 Classes Today
//                   </span>
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
//                     <svg className="mr-1.5 h-2 w-2 text-yellow-500" fill="currentColor" viewBox="0 0 8 8">
//                       <circle cx="4" cy="4" r="3" />
//                     </svg>
//                     5 Pending Assignments
//                   </span>
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//                     <svg className="mr-1.5 h-2 w-2 text-blue-500" fill="currentColor" viewBox="0 0 8 8">
//                       <circle cx="4" cy="4" r="3" />
//                     </svg>
//                     2 Messages
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Dashboard Grid */}
//         <div className="px-4 sm:px-0">
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//             {/* Quick Actions Card */}
//             <div className="bg-white overflow-hidden shadow-md rounded-2xl">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
//               </div>
//               <div className="p-6 space-y-4">
//               <Link 
//                   to="/students" 
//                   className="flex items-center p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition duration-200"
//                 >
//                   <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-500 flex items-center justify-center">
//                     <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-base font-medium text-gray-900">Students</p>
//                     <p className="text-sm text-gray-500">Manage student profiles</p>
//                   </div>
//                 </Link>
//                 <Link 
//                   to="/lesson-plan/create" 
//                   className="flex items-center p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition duration-200"
//                 >
//                   <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-500 flex items-center justify-center">
//                     <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-base font-medium text-gray-900">Create Lesson Plan</p>
//                     <p className="text-sm text-gray-500">Design new learning materials</p>
//                   </div>
//                 </Link>
                
//                 <Link 
//                   to="/attendance" 
//                   className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition duration-200"
//                 >
//                   <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
//                     <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-base font-medium text-gray-900">Record Attendance</p>
//                     <p className="text-sm text-gray-500">Track student presence</p>
//                   </div>
//                 </Link>
                
//                 <Link 
//                   to="/assessments" 
//                   className="flex items-center p-3 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition duration-200"
//                 >
//                   <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cyan-500 flex items-center justify-center">
//                     <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-base font-medium text-gray-900">Grade Assessments</p>
//                     <p className="text-sm text-gray-500">Evaluate student work</p>
//                   </div>
//                 </Link>
                
//                 <Link 
//                   to="/communication" 
//                   className="flex items-center p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition duration-200"
//                 >
//                   <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center">
//                     <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//                     </svg>
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-base font-medium text-gray-900">Message Parents</p>
//                     <p className="text-sm text-gray-500">Send updates and notices</p>
//                   </div>
//                 </Link>
//               </div>
//             </div>

//             {/* Today's Schedule Card */}
//             <div className="bg-white overflow-hidden shadow-md rounded-2xl">
//               <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
//                 <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
//                 <Link to="/schedule" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
//               </div>
//               <div className="divide-y divide-gray-200 overflow-hidden">
//                 {upcomingClasses.map((classItem) => (
//                   <div key={classItem.id} className="px-6 py-4 hover:bg-gray-50">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">{classItem.time}</p>
//                         <p className="text-base font-semibold text-gray-800">{classItem.subject}</p>
//                         <p className="text-sm text-gray-500">{classItem.grade} Grade • {classItem.students} Students</p>
//                       </div>
//                       <div>
//                         <Link to={`/class/${classItem.id}`} className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
//                           View
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//                 {upcomingClasses.length === 0 && (
//                   <div className="px-6 py-4 text-center text-gray-500">
//                     No classes scheduled for today
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Recent Activity Card */}
//             <div className="bg-white overflow-hidden shadow-md rounded-2xl">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
//               </div>
//               <div className="p-6 space-y-5">
//                 {recentActivities.map((activity) => (
//                   <div key={activity.id} className="flex">
//                     <div className="mr-4">
//                       {activity.type === 'assignment' && (
//                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                           <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                           </svg>
//                         </div>
//                       )}
//                       {activity.type === 'attendance' && (
//                         <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
//                           <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                           </svg>
//                         </div>
//                       )}
//                       {activity.type === 'lesson' && (
//                         <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
//                           <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                           </svg>
//                         </div>
//                       )}
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">{activity.date}</p>
//                       <p className="text-base font-medium text-gray-900">{activity.title}</p>
//                       <p className="text-sm">
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           activity.status === 'Graded' ? 'bg-green-100 text-green-800' : 
//                           activity.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
//                           'bg-purple-100 text-purple-800'
//                         }`}>
//                           {activity.status}
//                         </span>
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="bg-gray-50 px-6 py-3 flex justify-center">
//                 <Link to="/activities" className="text-sm text-indigo-600 hover:text-indigo-900">
//                   View all activities
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-100 mt-12 border-t border-gray-200 rounded-tl-3xl rounded-tr-3xl">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col sm:flex-row justify-between items-center">
//             <div className="mb-4 sm:mb-0">
//               <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
//                 {/* <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg> */}
//                 <HomeIcon className="h-8 w-8 text-indigo-600 mr-1" />
//               </Link>
//             </div>
//             <div className="text-sm text-gray-500 align-center">
//               <p className="mb-2">&copy; 2025 MagMax Educational Centre</p>
//               <p className='text-center'>
//                   All rights reserved.
//                 </p>
//             </div>
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// };

// export default TeacherDashboard;