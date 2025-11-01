"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import { updateMyProfile } from "@/services/userService";
import { getMyContacts, addContact, deleteContact } from "@/services/contactsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {  Trash2 } from "lucide-react";
import { EmergencyContact } from "@/types";

const profileSchema = z.object({ name: z.string().min(2, "Name is required.") });
type ProfileFormData = z.infer<typeof profileSchema>;

const contactSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  relationship: z.string().min(2, "Relationship is required."),
});
type ContactFormData = z.infer<typeof contactSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const profileForm = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });
  const contactForm = useForm<ContactFormData>({ resolver: zodResolver(contactSchema), defaultValues: { name: "", phone: "", relationship: "" }});

  const fetchContacts = () => {
    getMyContacts().then(res => setContacts(res.data));
  };

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name || "" });
      fetchContacts();
    }
  }, [user, profileForm]);

  const onProfileSubmit = (data: ProfileFormData) => {
    toast.promise(updateMyProfile(data), {
      loading: "Updating profile...",
      success: (res) => {
        setUser(res.data); 
        return "Profile updated successfully!";
      },
      error: "Failed to update profile.",
    });
  };
  
  const onAddContactSubmit = (data: ContactFormData) => {
    toast.promise(addContact(data), {
      loading: "Adding contact...",
      success: () => {
        contactForm.reset();
        fetchContacts(); // Refresh list
        return "Emergency contact added!";
      },
      error: "Failed to add contact.",
    });
  };

  const handleDeleteContact = (contactId: string) => {
     toast.promise(deleteContact(contactId), {
      loading: "Deleting contact...",
      success: () => {
        fetchContacts(); 
        return "Contact deleted.";
      },
      error: "Failed to delete contact.",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white" >Profile & Settings</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="contacts" >Emergency Contacts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>Update your personal details.</CardDescription></CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-sm">
                  <FormField name="name" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts">
          <Card>
            <CardHeader><CardTitle>Add New Emergency Contact</CardTitle></CardHeader>
            <CardContent>
              <Form {...contactForm}>
                 <form onSubmit={contactForm.handleSubmit(onAddContactSubmit)} className="space-y-4 max-w-sm">
                   <FormField name="name" control={contactForm.control} render={({ field }) => (<FormItem><FormLabel>Contact&apos;s Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField name="phone" control={contactForm.control} render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+91..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField name="relationship" control={contactForm.control} render={({ field }) => (<FormItem><FormLabel>Relationship</FormLabel><FormControl><Input placeholder="Father, Spouse, Friend..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <Button type="submit">Add Contact</Button>
                 </form>
              </Form>
            </CardContent>
          </Card>
          <Card className="mt-6">
             <CardHeader><CardTitle>Your Saved Contacts</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                {contacts.map(contact => (
                    <div key={contact.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                            <p className="font-semibold">{contact.name} <span className="text-sm text-muted-foreground">({contact.relationship})</span></p>
                            <p className="text-muted-foreground">{contact.phone}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                    </div>
                ))}
                {contacts.length === 0 && <p className="text-center text-muted-foreground py-4">No emergency contacts added yet.</p>}
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}