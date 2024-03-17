import { Avatar, AvatarFallback, AvatarImage } from "~~/components/ui/avatar";

export const NounsAvatar = () => {
  return (
    <Avatar>
      <AvatarImage src="https://d3c9os9v862gny.cloudfront.net/dXJsPWh0dHBzOi8vY2RuLmJ1dHRlcmNtcy5jb20veVhQSWtQZjFRT1NSMzc0MndKZmImd2lkdGg9NzI1" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
};
