import { Box, Image, Text, VStack } from '@chakra-ui/react';
import Posts from './Posts';
import profilePic from '../images/defaultpp.png';

const Profile = () => {
  return (
    <Box>
      <VStack p={7} m="auto" width="fit-content" borderRadius={6} bg="gray.700">
        <Image
          borderRadius="full"
          boxSize="80px"
          src={profilePic}
          alt="Profile"
        />
        
        <Text fontSize="lg" color="gray.400">
          Closet
        </Text>
      </VStack>

      <Posts />
    </Box>
  );
};
export default Profile;
