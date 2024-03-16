"use client";

import { useState } from "react";
import { TippingButton } from "./TippingButton";
import { Button } from "~~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog";
import { Label } from "~~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~~/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";

export const TippingModal = () => {
  const [tipPercentage, setTipPercentage] = useState("15");
  const [currency, setCurrency] = useState("USDC");
  const [preventClose, setPreventClose] = useState(false);

  const handleSubmit = () => {
    console.log(tipPercentage, currency);
    setPreventClose(!preventClose);
  };

  return (
    <Dialog open={preventClose} onOpenChange={setPreventClose}>
      <DialogTrigger>
        <Button>Tipping</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tipping</DialogTitle>
          <DialogDescription>
            <div>Fill out the form to tip a freelancer.</div>
            {preventClose && <div> You Must Tip</div>}
          </DialogDescription>
        </DialogHeader>
        <div>
          <legend>Select Tipping Percentage</legend>
          {preventClose ? (
            <RadioGroup defaultValue={tipPercentage} onValueChange={e => setTipPercentage(e)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="200" id="r1" />
                <Label htmlFor="r1">200%</Label>
              </div>
            </RadioGroup>
          ) : (
            <RadioGroup defaultValue={tipPercentage} onValueChange={e => setTipPercentage(e)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15" id="r1" />
                <Label htmlFor="r1">15%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="18" id="r2" />
                <Label htmlFor="r1">18%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="20" id="r2" />
                <Label htmlFor="r1">20%</Label>
              </div>
            </RadioGroup>
          )}
        </div>
        <div>
          <Label>Choose Currency</Label>
          <Select defaultValue={currency} onValueChange={e => setCurrency(e)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select your Token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="APECOIN">APECOIN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TippingButton />
        <Button onClick={handleSubmit}>Cancel</Button>
      </DialogContent>
    </Dialog>
  );
};
