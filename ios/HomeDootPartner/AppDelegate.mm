#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  if ([FIRApp defaultApp] == nil) {
    NSString *googleAppId = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"GOOGLE_APP_ID"];
    BOOL hasValidGoogleAppId =
      googleAppId != nil &&
      [googleAppId length] > 0 &&
      [googleAppId rangeOfString:@"REPLACE_WITH_IOS_APP_ID"].location == NSNotFound;

    if (hasValidGoogleAppId) {
      [FIRApp configure];
    } else {
      NSLog(@"[Firebase] Skipping FIRApp configure due to missing/invalid GOOGLE_APP_ID in GoogleService-Info.plist");
    }
  }

  self.moduleName = @"homedootpartner";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
