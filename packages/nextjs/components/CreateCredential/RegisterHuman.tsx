import React from "react";
import { ProfileForm } from "~~/components/CreateCredential/RegistrationForm/RegistrationForm";
import { Button } from "~~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog";

export const RegisterHuman = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Create +</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your Profile</DialogTitle>
          <DialogDescription>Fill out the form to create your profile and start selling your skills.</DialogDescription>
        </DialogHeader>
        <ProfileForm />
      </DialogContent>
    </Dialog>
  );
};
