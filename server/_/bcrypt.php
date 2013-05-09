<?php

/* Copied from http://stackoverflow.com/questions/6340105/how-can-we-create-a-fairly-secure-password-hash-in-php#6340197. HUGE THANKS to Andrew Moore, without whom even I would be able to break into this.*/

class Bcrypt {
  private $rounds;
  public function __construct($rounds = 12) {
    if(CRYPT_BLOWFISH != 1) {
      reply_error("server","Blowfish is not supported in this installation of PHP.");
    }
    $this->rounds = $rounds;
  }

  public function hash($input) {
    $hash = crypt($input, $this->getSalt());

    if(strlen($hash) > 13)
      return $hash;

    return false;
  }

  public function verify($input, $existingHash) {
    $hash = crypt($input, $existingHash);

    return $hash === $existingHash;
  }

  private function getSalt() {
    $salt = sprintf('$2a$%02d$', $this->rounds);

    $bytes = $this->getRandomBytes(16);

    $salt .= $this->encodeBytes($bytes);

    return $salt;
  }

  private $randomState;
  private function getRandomBytes($count) {
    $bytes = '';

    if(function_exists('openssl_random_pseudo_bytes') &&
       (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN')) { // OpenSSL slow on Win
      $bytes = openssl_random_pseudo_bytes($count);
    }

    if($bytes === '' && is_readable('/dev/urandom') &&
       ($hRand = @fopen('/dev/urandom', 'rb')) !== FALSE) {
      $bytes = fread($hRand, $count);
      fclose($hRand);
    }

    if(strlen($bytes) < $count) {
      $bytes = '';

      if($this->randomState === null) {
        $this->randomState = microtime();
        if(function_exists('getmypid')) {
          $this->randomState .= getmypid();
        }
      }

      for($i = 0; $i < $count; $i += 16) {
        $this->randomState = md5(microtime() . $this->randomState);

        if (PHP_VERSION >= '5') {
          $bytes .= md5($this->randomState, true);
        } else {
          $bytes .= pack('H*', md5($this->randomState));
        }
      }

      $bytes = substr($bytes, 0, $count);
    }

    return $bytes;
  }

  private function encodeBytes($input) {
    return strtr(rtrim(base64_encode($input), '='), '+', '.');
  }
}

?>